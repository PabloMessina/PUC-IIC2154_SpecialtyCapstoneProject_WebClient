import React, { Component } from 'react';
import { Line as LineChart, Bar as BarChart } from 'react-chartjs';
import { Row, Col, Table, Button, ButtonGroup, ControlLabel, Panel } from 'react-bootstrap';
import Select from 'react-select';
import Icon from 'react-fa';
import renderIf from 'render-if';

import app from '../../../app';
const participantService = app.service('/participants');
const evaluationService = app.service('/evaluations');

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

export default class Summary extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      instance: React.PropTypes.object,
      // React Router
      params: React.PropTypes.object,
      evaluations: React.PropTypes.array,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tab: 1,
      students: [],
      evaluations: [],
      selectedEvaluations: [],
      selectedStudents: [],
      loading: false,
      error: null,
      redraw: false,
      histogramEvaluation: 0,
      titleHistogram: '',
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.onEvaluationSelect = this.onEvaluationSelect.bind(this);
  }

  componentDidMount() {
    this.fetchStudents(this.props.instance.id);
    this.fetchEvaluations(this.props.instance.id)
      .then(evaluations => {
        const selectedEvaluations = evaluations.map(evaluation => evaluation.id);
        this.setState({ selectedEvaluations, titleHistogram: this.state.evaluations[0].title });
      });
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

  fetchStudents(instanceId) {
    const query = {
      instanceId,
      $populate: 'user',
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(students => this.setState({ students, error: null }))
      .catch(error => this.setState({ error }));
  }

  fetchEvaluations(instanceId) {
    this.setState({ loading: true });
    const query = {
      instanceId,
    };
    return evaluationService.find({ query })
      .then(result => result.data)
      .then(evaluations => {
        this.setState({ evaluations, loading: false, error: null });
        return evaluations;
      })
      .catch(error => this.setState({ error }));
  }

  handleSelect(tab) {
    this.setState({ tab });
  }

  render() {
    const { instance } = this.props;
    const { students, selectedEvaluations, selectedStudents } = this.state;
    const evaluations = this.state.evaluations.sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

    const dropdown = students.map(student => ({
      id: student.user.id,
      value: student.user.id,
      label: student.user.name,
    }));

    const filteredEvaluations = evaluations.filter(evaluation => selectedEvaluations.indexOf(evaluation.id) > -1);

    const { approvalGrade, minGrade, maxGrade } = instance;
    const labels = [];
    const max = [];
    const min = [];
    const avg = [];
    const reprove = [];
    filteredEvaluations.forEach(evaluation => {
      labels.push(evaluation.title);
      min.push(Math.floor((Math.random() * 15) + 25));
      avg.push(Math.floor((Math.random() * 15) + 45));
      max.push(Math.floor((Math.random() * 10) + 60));
      reprove.push(approvalGrade);
    });

    const dataGraph = selectedStudents.map(student => ({
      ...DEFAULT_LINE,
      label: student.label,
      borderColor: 'rgba(52, 73, 94,1.0)',
      backgroundColor: 'rgba(75,192,192,0)',
      pointBorderColor: 'rgba(52, 73, 94,1.0)',
      pointBackgroundColor: '#fff',
      pointHoverRadius: 6,
      pointRadius: 3,
      data: filteredEvaluations.map(() => Math.floor((Math.random() * 20) + 40)),
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

    // const grades = students.map(() => Math.floor((Math.random() * 20) + 40));
    // for (let i = 0; i < 100; i++) {
    //   grades.push(Math.floor((Math.random() * 100)));
    // }
    // const histData = Array.apply(null, Array(10)).map(Number.prototype.valueOf, 0);
    // grades.forEach(grade => {
    //   histData[Math.floor(grade * 10 / (maxGrade - minGrade))] += 1;
    // });
    const dataFailed = [1, 5, 8, 10, 13, 0, 0, 0, 0, 0];
    const dataPassed = [0, 0, 0, 0, 0, 15, 13, 10, 6, 2];

    const datasetsHistogram = [{
      ...DEFAULT_LINE,
      label: 'Failed',
      borderColor: 'rgba(192, 57, 43,1.0)',
      backgroundColor: 'rgba(192, 57, 43,0.5)',
      data: dataFailed,
    }, {
      ...DEFAULT_LINE,
      label: 'Passed',
      borderColor: 'rgba(39, 174, 96,1.0)',
      backgroundColor: 'rgba(39, 174, 96,0.5)',
      data: dataPassed,
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
      labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
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
                      {this.state.evaluations.map((evaluation, i) => (
                        <th key={i}>{evaluation.title}</th>
                      ))}
                      <th>Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                  {this.state.students.map((student, i) => (
                    <tr key={i}>
                      <td>{student.user.name}</td>
                      {this.state.evaluations.map((a, j) => (
                        <td key={j}>{Math.floor((Math.random() * 60) + 10)}</td>
                      ))}
                      <th>5,2</th>
                    </tr>
                  ))}
                  </tbody>
                </Table>
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
      </div>
    );
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
};
