import React, { PropTypes, Component } from 'react';
import { Line as LineChart, Bar as BarChart } from 'react-chartjs';
import { Row, Col, Table, Button, ButtonGroup, ControlLabel, Panel } from 'react-bootstrap';
import Select from 'react-select';
import Icon from 'react-fa';
import renderIf from 'render-if';
import json2csv from 'json2csv';
import FileSaver from 'browser-filesaver';
import { withRouter } from 'react-router';

import ErrorAlert from '../../error-alert';
import Excel from '../../../utils/excel';

import { withTimeSyncronizer } from '../../time-syncronizer';

import app, { currentUser } from '../../../app';
const attendanceService = app.service('/attendances');
const participantService = app.service('/participants');
const evaluationService = app.service('/evaluations');
const evaluationsQuestionService = app.service('/evaluations-questions');

import correction from '../../../utils/correction';
import grade from '../../../utils/grade.js';

// TODO: check hardcoded values

const GRAPH_OPTIONS = {
  responsive: true,
  scaleShowGridLines: true,
  scaleGridLineColor: 'rgba(0,0,0,1 )',
};

const DEFAULT_LINE = {
  fill: false,
  pointRadius: 0,
  pointHitRadius: 10,
  pointHoverRadius: 5,
  pointHoverBorderWidth: 1,
  borderWidth: 2,
};

const LINES = {
  MAX: {
    ...DEFAULT_LINE,
    borderColor: 'rgba(39, 174, 96,1.0)',

  },
  MIN: {
    ...DEFAULT_LINE,
    borderColor: '#c0392b',
  },
  AVG: {
    ...DEFAULT_LINE,
    borderColor: 'rgba(75,192,192,1)',
  },
  REPR: {
    ...DEFAULT_LINE,
    fill: true,
    backgroundColor: 'rgba(192, 57, 43,0.1)',
    borderColor: 'transparent',
    borderWidth: 0,
    pointHitRadius: 0,
    pointHoverRadius: 0,
  },
};

class Summary extends Component {

  static get propTypes() {
    return {
      organization: PropTypes.object,
      course: PropTypes.object,
      participant: PropTypes.object,
      membership: PropTypes.object,
      instance: PropTypes.object,
      // React Router
      params: PropTypes.object,
      getTime: PropTypes.func,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      tab: 1,
      students: [],
      evaluations: [],
      attendances: [],
      evaluationsQuestions: [],
      users: [],
      selectedEvaluations: [],
      selectedStudents: [],
      loading: false,
      error: null,
      redraw: false,
      histogramEvaluation: 0,
      titleHistogram: '',
    };
    this.onSelect = this.onSelect.bind(this);
    this.onEvaluationSelect = this.onEvaluationSelect.bind(this);

    this.fetchAttendances = this.fetchAttendances.bind(this);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.fetchEvaluations = this.fetchEvaluations.bind(this);
    this.fetchEvaluationsQuestions = this.fetchEvaluationsQuestions.bind(this);

    this.calculateTeamsPercentages = this.calculateTeamsPercentages.bind(this);
    this.createStudentDatasets = this.createStudentDatasets.bind(this);
    this.createHistogramDataset = this.createHistogramDataset.bind(this);

    this.renderStudent = this.renderStudent.bind(this);
    this.renderAssistant = this.renderAssistant.bind(this);
  }

  componentDidMount() {
    const { instance } = this.props;
    this.fetchStudents(instance);
    this.fetchEvaluations(instance)
      .then(evaluations => {
        evaluations.forEach(evaluation => {
          this.fetchAttendances(evaluation);
          this.fetchEvaluationsQuestions(evaluation);
        });
        const selectedEvaluations = evaluations.map(evaluation => evaluation.id);
        const titleHistogram = selectedEvaluations.length ? evaluations[0].title : '';
        return this.setState({ selectedEvaluations, titleHistogram });
      })
      .catch(error => this.setState({ error }));
  }

  onEvaluationSelect(e, evaluation) {
    e.target.blur();
    const selectedEvaluations = [...this.state.selectedEvaluations];
    const index = selectedEvaluations.indexOf(evaluation.id);
    if (index > -1) {
      selectedEvaluations.splice(index, 1);
    } else {
      selectedEvaluations.push(evaluation.id);
    }
    this.setState({ selectedEvaluations, redraw: false });
  }

  onSelect(tab) {
    this.setState({ tab });
  }

  getTotalPoints(evaluation) {
    return evaluation.questions.reduce((previous, current) => previous + current.evaluationsQuestion.points, 0);
  }

  getGrades(evaluation) {
    const teamPercentages = this.calculateTeamsPercentages(evaluation);
    const teamGrades = this.calculateTeamsGrades(teamPercentages);
    const studentGrades = this.assignStudentGrades(teamGrades, evaluation);
    return studentGrades;
  }

  getStudentAverage(grades) {
    const total = grades.reduce((sum, evalGrade) => sum + evalGrade, 0);
    const divider = (grades.length - grades.filter((g) => g === null).length);
    return divider ? total / divider : total / grades.length;
    // return total / grades.length; // Depending on way of calculating average.
  }

  getAnalyticsAverages(evalAnalytics) {
    const totalMin = evalAnalytics.reduce((sum, total) => (total.min ? sum + total.min : sum), 0);
    const totalMax = evalAnalytics.reduce((sum, total) => (total.max ? sum + total.max : sum), 0);
    const totalAvg = evalAnalytics.reduce((sum, total) => (total.avg ? sum + total.avg : sum), 0);
    const totalStddev = evalAnalytics.reduce((sum, total) => (total.stddev ? sum + total.stddev : sum), 0);
    return {
      min: totalMin || totalMin === 0 ? totalMin / evalAnalytics.length : null,
      max: totalMax || totalMax === 0 ? totalMax / evalAnalytics.length : null,
      avg: totalAvg || totalAvg === 0 ? totalAvg / evalAnalytics.length : null,
      stddev: totalStddev || totalStddev === 0 ? totalStddev / evalAnalytics.length : null,
    };
  }

  getMinMaxAvgStddev(evaluation) {
    const grades = this.getGrades(evaluation);
    if (grades.length === 0) return {};

    let min = grades[0].grade;
    let max = grades[0].grade;
    let avg = 0;
    grades.forEach(evalGrade => {
      avg += evalGrade.grade;
      if (evalGrade.grade < min) {
        min = evalGrade.grade;
      }
      if (evalGrade.grade > max) {
        max = evalGrade.grade;
      }
    });
    avg = avg / grades.length;
    const squareSum = grades.reduce((sum, current) => {
      const sqroot = Math.pow((current.grade - avg), 2);
      return current.grade ? sqroot + sum : sum;
    }, 0);
    const stddev = Math.sqrt(squareSum / grades.length);
    return { min, max, avg, stddev };
  }

  calculateTeamsPercentages(evaluation) {
    const answers = [...evaluation.answers];
    const questions = [...evaluation.questions];
    const attendances = this.state.attendances;
    const evaluationsQuestions = this.state.evaluationsQuestions[evaluation.id];
    const answeredTeams = []; // For filter
    const teamPointsTuple = []; // [{ teamId: 123345, points: 2 }]
    if (!evaluationsQuestions || !answers.length || !questions.length) return {};
    answers.sort((a, b) => {
      if (a.questionId < b.questionId) return -1;
      if (a.questionId > b.questionId) return 1;
      return 0;
    });
    questions.sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });

    questions.forEach(question => {
      const eq = evaluationsQuestions.find(item => item.questionId === question.id);
      answers.forEach(answer => {
        if (answer.questionId === question.id) {
          let options = {};
          if (question.qtype === 'tshort') {
            options = {
              threshold: 0.8,
              lower: true,
              special: true,
            };
          }
          const correctionQuestion = correction(question.qtype, question.answer, answer.answer, options);
          const pointsAwarded = correctionQuestion && correctionQuestion.correct ? eq.points : 0;
          // const pointsAwarded = eq.points;
          teamPointsTuple.push({ teamId: answer.teamId, points: pointsAwarded });
          answeredTeams.push(answer.teamId);
        }
      });
    });

    const maxPoints = evaluationsQuestions.reduce((previous, current) => current.points + previous, 0);
    const points = teamPointsTuple.reduce((previous, current) => {
      const teamId = current.teamId;
      const old = { ... previous };
      if (old[teamId]) old[teamId] = old[teamId] + current.points;
      else old[teamId] = current.points;
      return old;
    }, {});

    // Add teams that did not answer with points = 0
    if (attendances[evaluation.id]) { // WORKAROUND RACE CONDITION
      const allTeams = attendances[evaluation.id].map(attendance => attendance.teamId);
      const unansweredTeams = allTeams.filter((teamId) => answeredTeams.indexOf(teamId) === -1);
      Object(unansweredTeams).forEach(key => (points[key] = 0));
    }

    Object.keys(points).forEach(key => (points[key] = points[key] / maxPoints));
    return points;
  }

  calculateTeamsGrades(teamPercentage) {
    const { instance } = this.props;
    const {
      // approvalGrade,
      minGrade,
      maxGrade,
    } = instance;

    return Object.keys(teamPercentage).reduce((previous, teamId) => {
      // const gradeValue = grade(teamPercentage[teamId], maxGrade, minGrade, approvalGrade);
      const gradeValue = grade(teamPercentage[teamId], maxGrade, minGrade, 0.5);
      return { ...previous, [teamId]: gradeValue };
    }, {});
  }

  assignStudentGrades(teamsGradesTuple, evaluation) {
    const users = this.state.students.map(participant => participant.user);
    const { attendances } = this.state;
    return attendances[evaluation.id] ? attendances[evaluation.id].map(attendance => {
      const user = users.find(item => attendance.userId === item.id);
      const teamId = attendance.teamId;
      const studentName = user ? user.name : '';
      return {
        studentName,
        studentId: attendance.userId,
        grade: teamsGradesTuple[teamId] || 0,
      };
    }) : [];
  }

  createStudentDatasets(evaluations, students) {   // evaluationGrades and students already filtered
    const data = students.map(student => ({ studentId: student.id, studentName: student.label, grades: [] }));
    evaluations.forEach(evaluation => {
      const studentGrades = this.getGrades(evaluation);
      students.forEach((student, k) => {
        const index = studentGrades.findIndex(element => element.studentId === student.id);
        // const indexData = data.findIndex(element => element.studentId === student.id); // esto es igual a k
        if (index > -1) { // Student did take test
          // data[indexData].grades.push(studentGrades[index].grade);
          data[k].grades.push(studentGrades[index].grade);
        } else {
          // data[indexData].grades.push(null); // Averiguar como acepta falta de datos Chart.js
          data[k].grades.push(null);
        }
      });
    });
    return data;
  }

  createHistogramDataset(evaluation, min, max, approvalGrade, barNumber) {
    const studentGrades = this.getGrades(evaluation);
    const step = ((max - min) / barNumber);
    const range = [];
    const labels = [];
    const dataset = [];
    let failed = 0;
    let passed = 0;
    let i = min;
    let k = 0;
    let j = 0;

    while (i < max) {
      range.push(i);
      i += step;
    }
    range.push(max);

    for (k = 0; k < range.length - 2; k++) {
      let count = 0;
      for (j = 0; j < studentGrades.length; j++) {
        if (studentGrades[j].grade >= range[k] && studentGrades[j].grade < range[k + 1]) {
          count++;
        }
      }
      labels.push(range[k].toFixed(2) + ' - ' + range[k + 1].toFixed(2));  // eslint-disable-line
      dataset.push(count);
    }

    // Border case: last step in range
    let lastCount = 0;
    studentGrades.forEach(studentGrade => {
      if (studentGrade.grade >= range[range.length - 2] && studentGrade.grade <= max) {
        lastCount++;
      }
      if (studentGrade.grade < approvalGrade) {
        failed++;
      } else {
        passed++;
      }
    });
    dataset.push(lastCount);
    labels.push(range[range.length - 2].toFixed(2) + ' - ' + max.toFixed(2));  // eslint-disable-line
    return { labels, dataset, failed, passed };
  }

  formatForJSON2CSV(gradesTable, evaluations) {
    const labels = [];
    evaluations.forEach(evaluation => {
      labels.push(evaluation.title);
    });
    const fields = ['Student name'].concat(labels);
    const gradesJSON2CSV = [];
    gradesTable.forEach(studentGrades => {
      const grades = studentGrades.grades.reduce((previous, current, i) =>
      ({
        ...previous,
        [labels[i]]: current,
      }), { 'Student name': studentGrades.studentName });
      // ((evalGrade, i) => {
      //   grades.push({ [[labels[i]]]: evalGrade });
      // });
      gradesJSON2CSV.push(grades);
    });
    return { gradesJSON2CSV, fields };
  }

  exportCSV(studentTable, evaluations, courseName, spanishDelimiter) {
    const gradesCSVformat = this.formatForJSON2CSV(studentTable, evaluations);
    json2csv({
      data: gradesCSVformat.gradesJSON2CSV,
      fields: gradesCSVformat.fields,
      del: spanishDelimiter ? ';' : ',',
    },
    (error, csv) => {
      if (error) {
        this.setState({ error });
      } else {
        const blob = new Blob([csv], { type: 'data:text/csv;charset=utf-8,' });
        FileSaver.saveAs(blob, `${courseName}.csv`);
      }
    });
  }

  fetchAttendances(evaluation) {
    const evaluationId = evaluation.id || evaluation;
    const query = {
      evaluationId,
    };
    return attendanceService.find({ query })
      .then(result => result.data)
      .then(newAttendances => {
        const attendances = { ...this.state.attendances };
        attendances[evaluationId] = newAttendances;
        this.setState({ attendances });
      })
      .catch(error => this.setState({ error }));
  }

  fetchStudents(instance) {
    const query = {
      instanceId: instance.id || instance,
      $populate: 'user',
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(students => this.setState({ students, error: null }))
      .catch(error => this.setState({ error }));
  }

  fetchEvaluations(instance) {
    const { getTime } = this.props;
    this.setState({ loading: true });
    const query = {
      instanceId: instance.id || instance,
      finishAt: { $lt: getTime() },
      $populate: ['answer', 'question'],
      $sort: { createdAt: -1 },
    };
    return evaluationService.find({ query })
      .then(result => result.data)
      .then(evaluations => {
        this.setState({ evaluations, loading: false, error: null });
        return evaluations;
      })
      .catch(error => this.setState({ error }));
  }

  fetchEvaluationsQuestions(evaluation) {
    const evaluationId = evaluation.id || evaluation;
    this.setState({ loading: true });
    const query = {
      evaluationId,
    };
    return evaluationsQuestionService.find({ query })
      .then(result => result.data)
      .then(eq => {
        const evaluationsQuestions = { ...this.state.evaluationsQuestions };
        evaluationsQuestions[evaluationId] = eq;
        this.setState({ evaluationsQuestions, loading: false, error: null });
        return evaluationsQuestions;
      })
      .catch(error => this.setState({ error }));
  }

  gradesToExcelClick = (...args) => {
    const error = Excel.gradesToExcel(...args);
    if (error) this.setState({ error });
  }

  renderAssistant() {
    const {
      instance,
      // participant,
      course,
    } = this.props;
    const {
      attendances,
      students,
      selectedEvaluations,
      evaluationsQuestions,
    } = this.state;

    const evaluations = this.state.evaluations.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    if (!students.length
      || !evaluations.length
      // || !selectedEvaluations.length
      || !Object.keys(attendances).length
      || !Object.keys(evaluationsQuestions).length
    ) {
      return (<p></p>);
    }

    // const user = currentUser();
    const dropdown = students.map(student => ({
      id: student.user.id,
      value: student.user.id,
      label: student.user.name,
    }));
    const allStudents = students.map(student => ({
      id: student.user.id,
      value: student.user.id,
      label: student.user.name,
    }));

    // const me = {
    //   id: user.id,
    //   value: user.id,
    //   label: user.name,
    // };

    const selectedStudents = this.state.selectedStudents;
    const filteredEvaluations = evaluations.filter(evaluation => selectedEvaluations.indexOf(evaluation.id) > -1);
    const completeAnalytics = [];
    evaluations.forEach((evaluation) => {
      completeAnalytics.push(this.getMinMaxAvgStddev(evaluation));
    });
    const avrgs = this.getAnalyticsAverages(completeAnalytics);
    // if (selectedEvaluations.length > 0) {
    //   this.setState({ histogramEvaluation: selectedEvaluations[0] });
    // }


    const { approvalGrade, minGrade, maxGrade } = instance;
    const labels = [];
    const max = [];
    const min = [];
    const avg = [];
    const reprove = [];
    // const studentGrades = [];
    filteredEvaluations.forEach(evaluation => {
      const analyticsValues = this.getMinMaxAvgStddev(evaluation);
      labels.push(evaluation.title);
      min.push(analyticsValues.min);
      avg.push(analyticsValues.avg);
      max.push(analyticsValues.max);
      reprove.push(approvalGrade);
    });

    const studentData = this.createStudentDatasets(filteredEvaluations, selectedStudents);
    const studentTable = this.createStudentDatasets(evaluations, allStudents);

    const dataGraph = studentData.map(student => ({
      ...DEFAULT_LINE,
      label: student.studentName,
      borderColor: 'rgba(52, 73, 94,1.0)',
      backgroundColor: 'rgba(75,192,192,0)',
      pointBorderColor: 'rgba(52, 73, 94,1.0)',
      pointBackgroundColor: '#fff',
      pointHoverRadius: 6,
      pointRadius: 3,
      data: student.grades,
    }));

    const dataAnalitycs = [{
      ...LINES.MAX,
      label: 'Max',
      data: max,
    }, {
      ...LINES.AVG,
      label: 'Average',
      data: avg,
    }, {
      ...LINES.MIN,
      label: 'Min',
      data: min,
    }, {
      ...LINES.REPR,
      label: 'Reprobation',
      data: reprove,
    }];

    const datasets = [...dataAnalitycs, ...dataGraph];

    const options = {
      ...GRAPH_OPTIONS,
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            // beginAtZero: true,
            suggestedMin: minGrade,
            suggestedMax: maxGrade,
          },
        }],
      },
    };

    const data = {
      labels,
      datasets,
    };

    const evaluationData = this.createHistogramDataset(
      evaluations[this.state.histogramEvaluation],
      minGrade,
      maxGrade,
      approvalGrade,
      Math.ceil(Math.sqrt(students.length))); // Recommended amount of classes in histogram

    const datasetsHistogram = [{
      ...DEFAULT_LINE,
      label: 'Frequency',
      borderColor: 'rgba(39, 174, 96,1.0)',
      backgroundColor: 'rgba(39, 174, 96,0.5)',
      data: evaluationData.dataset,
    }];

    const optionsHistogram = {
      ...GRAPH_OPTIONS,
      title: {
        display: true,
        text: this.state.titleHistogram,
        fontSize: 18,
      },
    };

    const dataHistogram = {
      labels: evaluationData.labels,
      datasets: datasetsHistogram,
    };

    return (
      <div style={styles.container}>
        <Row>
          {renderIf(this.state.tab === 1)(() =>
            <Col xs={6}>
              <Select
                multi
                options={dropdown}
                placeholder="Students..."
                onChange={(value, label) => this.setState({ selectedStudents: label, redraw: true })}
                isLoading={this.state.loading}
                disabled={false}
                value={selectedStudents}
              />
            </Col>
          )}
          <Col xsOffset={6}>
            <Button
              onClick={(e) => { this.setState({ tab: 1 }); e.target.blur(); }}
              bsStyle={this.state.tab === 1 ? 'primary' : 'link'}
            >
              <Icon style={styles.icon} name="area-chart" />
              Chart
            </Button>
            <Button
              onClick={(e) => { this.setState({ tab: 2 }); e.target.blur(); }}
              bsStyle={this.state.tab === 2 ? 'primary' : 'link'}
            >
              <Icon style={styles.icon} name="table" />
              Table
            </Button>
            <Button
              onClick={(e) => { this.setState({ tab: 3 }); e.target.blur(); }}
              bsStyle={this.state.tab === 3 ? 'primary' : 'link'}
            >
              <Icon style={styles.icon} name="bar-chart" />
              Histogram
            </Button>
          </Col>
          <br />
          {renderIf(this.state.tab === 1)(() =>
            <Row>
              {renderIf(selectedEvaluations.length > 1)(() =>
                <Col xs={8}>
                  <LineChart
                    data={data}
                    redraw={this.state.redraw}
                    options={options}
                    width="700" height="500"
                  />
                </Col>
              )}
              {renderIf(selectedEvaluations.length <= 1)(() =>
                <Col xs={8}>
                  <Panel header="Chart tool">
                    Please select at least two evaluations.
                  </Panel>
                </Col>
              )}
              <Col xsOffset={8}>
                <ControlLabel>Evaluations</ControlLabel>
                <Col xs={10}>
                  <ButtonGroup vertical block>
                    {evaluations.map(evaluation => (
                      <Button
                        bsStyle={selectedEvaluations.indexOf(evaluation.id) > -1 ? 'primary' : 'default'}
                        key={evaluation.id}
                        onClick={e => this.onEvaluationSelect(e, evaluation)}
                      >
                        {evaluation.title}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Col>
              </Col>
            </Row>
          )}
          {renderIf(this.state.tab === 2)(() =>
            <Row>
              <Col xs={12}>
                <Table striped condensed hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      {evaluations.map((evaluation, i) => (
                        <th key={i}>{evaluation.title}</th>
                      ))}
                      <th>Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                  {studentTable.map((student, i) => (
                    <tr key={i}>
                      <td>{student.studentName}</td>
                      {student.grades.map((evalGrade, j) => (
                        <td key={j}>{evalGrade || evalGrade === 0 ? evalGrade.toFixed(3) : null}</td>
                      ))}
                      <th>{this.getStudentAverage(student.grades).toFixed(3)}</th>
                    </tr>
                  ))}
                  </tbody>
                </Table>
                <Table condensed hover>
                  <thead>
                    <tr>
                      <th>Analytics Variable</th>
                      {evaluations.map((evaluation, i) => (
                        <th key={i}>{evaluation.title}</th>
                      ))}
                      <th>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Minimum</th>
                      {completeAnalytics.map((evaluation, k) => (
                        <td key={k}>{evaluation.min || evaluation.min === 0 ? evaluation.min.toFixed(3) : null}</td>
                      ))}
                      <th>{(avrgs.min || avrgs.min === 0) ? avrgs.min.toFixed(3) : null}</th>
                    </tr>
                    <tr>
                      <th>Maximum</th>
                      {completeAnalytics.map((evaluation, k) => (
                        <td key={k}> {evaluation.max || evaluation.max === 0 ? evaluation.max.toFixed(3) : null} </td>
                      ))}
                      <th>{(avrgs.max || avrgs.max === 0) ? avrgs.max.toFixed(3) : null}</th>
                    </tr>
                    <tr>
                      <th>Average</th>
                      {completeAnalytics.map((evaluation, k) => (
                        <td key={k}> {evaluation.avg || evaluation.avg === 0 ? evaluation.avg.toFixed(3) : null} </td>
                      ))}
                      <th>{(avrgs.avg || avrgs.avg === 0) ? avrgs.avg.toFixed(3) : null}</th>
                    </tr>
                    <tr>
                      <th>Standard Deviation</th>
                      {completeAnalytics.map((evaluation, k) => (
                        <td key={k}>
                          {(evaluation.stddev || evaluation.stddev === 0)
                            ? evaluation.stddev.toFixed(3)
                            : null}
                        </td>
                      ))}
                      <th>{avrgs.stddev || avrgs.stddev === 0 ? avrgs.stddev.toFixed(3) : null}</th>
                    </tr>
                  </tbody>
                </Table>
                <Row>
                  <Col>
                    <Button
                      bsStyle="primary"
                      style={styles.download}
                      onClick={() => this.gradesToExcelClick(evaluations, studentTable, course.name)}
                    >
                      Download table as Excel
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      bsStyle="primary"
                      style={styles.download}
                      onClick={() => this.exportCSV(studentTable, evaluations, course.name, false)}
                    >
                      Download table as CSV for Office in English
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      bsStyle="primary"
                      style={styles.download}
                      onClick={() => this.exportCSV(studentTable, evaluations, course.name, true)}
                    >
                      Download table as CSV for Office in Spanish
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        {renderIf(this.state.tab === 3)(() =>
          <Row>
            <Col xs={8}>
              <BarChart
                data={dataHistogram}
                redraw
                options={optionsHistogram}
                width="700" height="500"
              />
              <h5>Failed: {evaluationData.failed} | Passed: {evaluationData.passed}</h5>
            </Col>
            <Col xsOffset={8}>
              <ControlLabel>Evaluations</ControlLabel>
              <Col xs={10}>
                <ButtonGroup vertical block>
                  {evaluations.map((evaluation, i) => (
                    <Button
                      bsStyle={this.state.histogramEvaluation === i ? 'primary' : 'default'}
                      key={i}
                      onClick={() => this.setState({ histogramEvaluation: i, titleHistogram: evaluation.title })}
                    >
                      {evaluation.title}
                    </Button>
                  ))}
                </ButtonGroup>
              </Col>
            </Col>
          </Row>
        )}
        </Row>
        <ErrorAlert
          error={this.state.error}
          onDismiss={() => this.setState({ error: null })}
        />
      </div>
    );
  }

  renderStudent() {
    const {
      instance,
      // participant,
    } = this.props;
    const {
      attendances,
      students,
      selectedEvaluations,
      evaluationsQuestions,
    } = this.state;
    const evaluations = this.state.evaluations.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
    if (!students.length
      || !evaluations.length
      // || !selectedEvaluations.length
      || !Object.keys(attendances).length
      || !Object.keys(evaluationsQuestions).length
    ) {
      return (<p></p>);
    }

    const filteredEvaluations = evaluations.filter(evaluation => selectedEvaluations.indexOf(evaluation.id) > -1);

    const completeAnalytics = [];
    evaluations.forEach((evaluation) => {
      completeAnalytics.push(this.getMinMaxAvgStddev(evaluation));
    });
    const avrgs = this.getAnalyticsAverages(completeAnalytics);

    const { approvalGrade, minGrade, maxGrade } = instance;
    const labels = [];
    const max = [];
    const min = [];
    const avg = [];
    const reprove = [];

    filteredEvaluations.forEach(evaluation => {
      const analyticsValues = this.getMinMaxAvgStddev(evaluation);
      labels.push(evaluation.title);
      min.push(analyticsValues.min);
      avg.push(analyticsValues.avg);
      max.push(analyticsValues.max);
      reprove.push(approvalGrade);
    });

    const currentStudent = [{ id: currentUser().id, label: currentUser().name, value: currentUser().id }];

    const studentData = this.createStudentDatasets(filteredEvaluations, currentStudent);
    const studentTable = this.createStudentDatasets(evaluations, currentStudent);

    const dataGraph = studentData.map(student => ({
      ...DEFAULT_LINE,
      label: student.studentName,
      borderColor: 'rgba(52, 73, 94,1.0)',
      backgroundColor: 'rgba(75,192,192,0)',
      pointBorderColor: 'rgba(52, 73, 94,1.0)',
      pointBackgroundColor: '#fff',
      pointHoverRadius: 6,
      pointRadius: 3,
      data: student.grades,
    }));

    const dataAnalitycs = [{
      ...LINES.MAX,
      label: 'Max',
      data: max,
    }, {
      ...LINES.AVG,
      label: 'Average',
      data: avg,
    }, {
      ...LINES.MIN,
      label: 'Min',
      data: min,
    }, {
      ...LINES.REPR,
      label: 'Reprobation',
      data: reprove,
    }];

    const datasets = [...dataAnalitycs, ...dataGraph];

    const options = {
      ...GRAPH_OPTIONS,
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            // beginAtZero: true,
            suggestedMin: minGrade,
            suggestedMax: maxGrade,
          },
        }],
      },
    };

    const data = {
      labels,
      datasets,
    };

    return (
      <div style={styles.container}>
        <Row>
          <Col xsOffset={3}>
            <Button
              onClick={(e) => { this.setState({ tab: 1 }); e.target.blur(); }}
              bsStyle={this.state.tab === 1 ? 'primary' : 'link'}
            >
              <Icon style={styles.icon} name="area-chart" />
              Chart
            </Button>
            <Button
              onClick={(e) => { this.setState({ tab: 2 }); e.target.blur(); }}
              bsStyle={this.state.tab === 2 ? 'primary' : 'link'}
            >
              <Icon style={styles.icon} name="table" />
              Table
            </Button>
          </Col>
          <br />
          {renderIf(this.state.tab === 1)(() =>
            <Row>
              {renderIf(selectedEvaluations.length > 1)(() =>
                <Col xs={8}>
                  <LineChart
                    data={data}
                    redraw={this.state.redraw}
                    options={options}
                    width="700" height="500"
                  />
                </Col>
              )}
              {renderIf(selectedEvaluations.length <= 1)(() =>
                <Col xs={8}>
                  <Panel header="Chart tool">
                    Please select at least two evaluations.
                  </Panel>
                </Col>
              )}
              <Col xsOffset={8}>
                <ControlLabel>Evaluations</ControlLabel>
                <Col xs={10}>
                  <ButtonGroup vertical block>
                    {evaluations.map(evaluation => (
                      <Button
                        bsStyle={selectedEvaluations.indexOf(evaluation.id) > -1 ? 'primary' : 'default'}
                        key={evaluation.id}
                        onClick={e => this.onEvaluationSelect(e, evaluation)}
                      >
                        {evaluation.title}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Col>
              </Col>
            </Row>
          )}
          {renderIf(this.state.tab === 2)(() =>
            <Row>
              <Col xs={12}>
                <Table striped condensed hover>
                  <thead>
                    <tr>
                      <th>Student</th>
                      {this.state.evaluations.map((evaluation, i) => (
                        <th key={i}>{evaluation.title}</th>
                      ))}
                      <th>Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                  {studentTable.map((student, i) => (
                    <tr key={i}>
                      <td>{student.studentName}</td>
                      {student.grades.map((evalGrade, j) => (
                        <td key={j}>{evalGrade || evalGrade === 0 ? evalGrade.toFixed(3) : null}</td>
                      ))}
                      <th>{this.getStudentAverage(student.grades).toFixed(3)}</th>
                    </tr>
                  ))}
                  </tbody>
                </Table>
                <Table condensed hover>
                  <thead>
                    <tr>
                      <th>Analytics Variable</th>
                      {evaluations.map((evaluation, i) => (
                        <th key={i}>{evaluation.title}</th>
                      ))}
                      <th>Average</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>Minimum</th>
                      {completeAnalytics.map((evaluation, k) => (
                        <td key={k}>{evaluation.min || evaluation.min === 0 ? evaluation.min.toFixed(3) : null}</td>
                      ))}
                      <th>{avrgs.min || avrgs.min === 0 ? avrgs.min.toFixed(3) : null}</th>
                    </tr>
                    <tr>
                      <th>Maximum</th>
                      {completeAnalytics.map((evaluation, k) => (
                        <td key={k}> {evaluation.max || evaluation.max === 0 ? evaluation.max.toFixed(3) : null} </td>
                      ))}
                      <th>{avrgs.max || avrgs.max === 0 ? avrgs.max.toFixed(3) : null}</th>
                    </tr>
                    <tr>
                      <th>Average</th>
                      {completeAnalytics.map((evaluation, k) => (
                        <td key={k}> {evaluation.avg || evaluation.avg === 0 ? evaluation.avg.toFixed(3) : null} </td>
                      ))}
                      <th>{avrgs.avg || avrgs.avg === 0 ? avrgs.avg.toFixed(3) : null}</th>
                    </tr>
                    <tr>
                      <th>Standard Deviation</th>
                      {completeAnalytics.map((evaluation, k) => (
                        <td key={k}>
                          {evaluation.stddev || evaluation.stddev === 0
                              ? evaluation.stddev.toFixed(3)
                              : null}
                        </td>
                      ))}
                      <th>{avrgs.stddev || avrgs.stddev === 0 ? avrgs.stddev.toFixed(3) : null}</th>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </Row>
        <ErrorAlert
          error={this.state.error}
          onDismiss={() => this.setState({ error: null })}
        />
      </div>
    );
  }

  render() {
    const {
      membership,
      participant,
    } = this.props;

    const canEdit = ['admin', 'write'].includes(membership.permission) || ['admin'].includes(participant.permission);

    if (canEdit) return this.renderAssistant();
    return this.renderStudent();
  }
}

const styles = {
  container: {

  },
  menu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 15,
  },
  icon: {
    paddingRight: 7,
  },
  download: {
    margin: 5,
    marginLeft: 40,
  },
};
export default withRouter(withTimeSyncronizer({ ticks: Infinity })(Summary));
