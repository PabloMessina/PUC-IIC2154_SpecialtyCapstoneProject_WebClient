import React, { Component } from 'react';
import { Line as LineChart } from 'react-chartjs';
import { Row, Col, Table, Button, ButtonGroup, ControlLabel } from 'react-bootstrap';
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
  scaleGridLineWidth: 1,
  scaleShowHorizontalLines: true,
  scaleShowVerticalLines: true,
  bezierCurve: true,
  bezierCurveTension: 0.4,
  pointDot: true,
  pointDotRadius: 4,
  pointDotStrokeWidth: 1,
  pointHitDetectionRadius: 20,
  datasetStroke: true,
  datasetStrokeWidth: 2,
  datasetFill: true,
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
      isChart: true,
      students: [],
      evaluations: [],
      selectedEvaluations: [],
      selectedStudents: [],
      loading: false,
      error: null,
      redraw: false,
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
        this.setState({ selectedEvaluations });
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
    const selectedEvaluations = this.state.selectedEvaluations;
    const selectedStudents = this.state.selectedStudents;
    const evaluations = this.state.evaluations.sort((a, b) => new Date(b.startAt) - new Date(a.startAt));
    const students = this.state.students;

    const dropdown = students.map(student => ({
      id: student.user.id,
      value: student.user.id,
      label: student.user.name,
    }));

    const selectedEvaluationsLabel = evaluations.filter(evaluation => selectedEvaluations.indexOf(evaluation.id) > -1);

    const labels = [];
    const max = [];
    const min = [];
    const avg = [];
    selectedEvaluationsLabel.forEach(evaluation => {
      labels.push(evaluation.title);
      min.push(Math.floor((Math.random() * 15) + 25));
      avg.push(Math.floor((Math.random() * 15) + 45));
      max.push(Math.floor((Math.random() * 10) + 60));
    });

    const dataGraph = selectedStudents.map(student => ({
      label: student.label,
      borderColor: 'rgba(52, 73, 94,1.0)',
      borderCapStyle: 'butt',
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(52, 73, 94,1.0)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 3,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(52, 73, 94,1.0)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 5,
      pointRadius: 5,
      pointHitRadius: 10,
      data: selectedEvaluationsLabel.map(() => Math.floor((Math.random() * 20) + 40)),
    }));
    const dataAnalitycs = [
      {
        label: 'Max',
        backgroundColor: 'rgba(75,192,192,0.1)',
        borderColor: 'rgba(39, 174, 96,1.0)',
        borderCapStyle: 'butt',
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(39, 174, 96,1.0)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 3,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(39, 174, 96,1.0)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 5,
        pointRadius: 5,
        pointHitRadius: 10,
        data: max,
      },
      {
        label: 'Avg',
        backgroundColor: 'rgba(75,192,192,0.25)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 3,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 5,
        pointRadius: 5,
        pointHitRadius: 10,
        data: avg,
      },
      {
        label: 'Min',
        backgroundColor: 'rgba(192, 57, 43,0.5)',
        borderColor: '#e74c3c',
        borderCapStyle: 'butt',
        borderJoinStyle: 'miter',
        pointBorderColor: '#e74c3c',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 3,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#e74c3c',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 5,
        pointRadius: 5,
        pointHitRadius: 10,
        data: min,
      },
    ];
    const datasets = [...dataAnalitycs, ...dataGraph];

    const data = {
      labels,
      datasets,
    };
    return (
      <div style={styles.container}>
        <Row>
          {renderIf(this.state.isChart)(() =>
            <Col xs={8}>
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
          <Col xsOffset={8}>
            <Button bsStyle="link" onClick={() => this.setState({ isChart: true })}>
              <Icon style={styles.icon} name="area-chart" />
              Chart
            </Button>
            <Button bsStyle="link" onClick={() => this.setState({ isChart: false })}>
              <Icon style={styles.icon} name="table" />
              Table
            </Button>
          </Col>
          <br />
          {renderIf(this.state.isChart)(() =>
            <Row>
              <Col xs={9}>
                <LineChart
                  data={data}
                  redraw={this.state.redraw}
                  options={GRAPH_OPTIONS}
                  width="700" height="500"
                />
              </Col>
              <Col xs={3}>
                <ControlLabel style={{}}>Evaluations</ControlLabel>
                <ButtonGroup vertical block>
                  {evaluations.map(evaluation => (
                    <Button
                      key={evaluation.id}
                      onClick={e => this.onEvaluationSelect(e, evaluation)}
                      active={selectedEvaluations.indexOf(evaluation.id) > -1}
                    >
                      {evaluation.title}
                    </Button>
                  ))}
                </ButtonGroup>
              </Col>
            </Row>
          )}
          {renderIf(!this.state.isChart)(() =>
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
