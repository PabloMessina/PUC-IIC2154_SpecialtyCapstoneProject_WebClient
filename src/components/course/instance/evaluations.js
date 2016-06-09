import React, { PropTypes, Component } from 'react';
import { Panel, Col, Button } from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import renderIf from 'render-if';
import moment from 'moment';

import EvaluationCell from '../../evaluation-cell';

import app, { currentUser } from '../../../app';
const evaluationService = app.service('/evaluations');
const attendanceService = app.service('/attendances');


class InstanceEvaluations extends Component {

  static get propTypes() {
    return {
      organization: PropTypes.object,
      course: PropTypes.object,
      instance: PropTypes.object,
      participant: PropTypes.object,
      membership: PropTypes.object,
      // React Router
      router: PropTypes.object,
      params: PropTypes.object,
      evaluations: PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      evaluations: [],
      participant: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      evaluations: props.evaluations,
      attendances: [],
    };
    this.renderRow = this.renderRow.bind(this);
    this.createEvaluation = this.createEvaluation.bind(this);
    this.fetchEvaluations = this.fetchEvaluations.bind(this);
    this.onEvaluationClick = this.onEvaluationClick.bind(this);
  }

  componentDidMount() {
    // Fetch organization
    // const query = this.props.location.query;
    const instance = this.props.instance;
    this.fetchEvaluations(instance);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.instance && nextProps.instance.id !== this.props.instance.id) {
      this.fetchEvaluations(nextProps.instance);
    }
  }

  onEvaluationClick(evaluation) {
    const url = `/evaluations/show/${evaluation.id}`;
    return this.props.router.push(url);
  }

  createEvaluation() {
    const instanceId = this.props.instance.id;
    const userId = currentUser().id;
    return evaluationService.create({ userId, instanceId })
      .then(evaluation => {
        const url = `/evaluations/show/${evaluation.id}`;
        return this.props.router.push(url);
      });
  }

  fetchEvaluations(instance) {
    let query = {
      instanceId: instance.id || instance,
      $populate: 'responsable',
    };
    return evaluationService.find({ query })
      .then(result => result.data)
      .then(evaluations => {
        this.setState({ evaluations });
        query = {
          userId: currentUser().id,
          evaluationId: { $in: evaluations.map(e => e.id) },
        };
        return attendanceService.find({ query });
      })
      .then(result => result.data)
      .then(attendances => this.setState({ attendances, error: null }))
      .catch(error => this.setState({ error }));
  }

  renderRow(evaluation, i) {
    return (
      <div key={i}>
        <EvaluationCell
          style={styles.cell}
          evaluation={evaluation}
          onEvaluationClick={this.onEvaluationClick}
        />
        <hr />
      </div>
    );
  }

  render() {
    const participant = this.props.participant;
    const canEdit = ['admin', 'write'].includes(participant.permission);

    const attendances = this.state.attendances;
    const evaluations = this.state.evaluations
      .filter(e => canEdit || attendances.findIndex(a => a.evaluationId === e.id) > -1)
      .filter(e => canEdit || e.published);

    const sections = {
      inProgress: [],
      upcoming: [],
      done: [],
    };

    // sorted quizes
    const now = moment();
    evaluations.forEach(evaluation => {
      if (moment(evaluation.finishAt) < now) {
        sections.done.push(evaluation);
      } else if (moment(evaluation.startAt) < now) {
        sections.inProgress.push(evaluation);
      } else {
        sections.upcoming.push(evaluation);
      }
    });

    return (
      <div style={styles.container}>
        <Col xs={12} md={8}>
          <h4 style={styles.title}>In Progress</h4>
          {sections.inProgress.map(this.renderRow)}
          {renderIf(sections.inProgress.length === 0)(() => (
            <div>
              <p>There are no evaluations in progress</p>
              <hr />
            </div>
          ))}

          <h4 style={styles.title}>Upcoming Quizzes</h4>
          {sections.upcoming.map(this.renderRow)}
          {renderIf(sections.upcoming.length === 0)(() => (
            <div>
              <p>There are no upcoming evaluations</p>
              <hr />
            </div>
          ))}

          <h4 style={styles.title}>Done</h4>
          {sections.done.map(this.renderRow)}
          {renderIf(sections.done.length === 0)(() => (
            <div>
              <p>There are no evaluations done</p>
              <hr />
            </div>
          ))}
        </Col>

        <Col xs={12} md={4}>
          <Panel>
            <h5><Icon style={styles.icon} name="lightbulb-o" /> Evaluations</h5>
            <hr />
            <p>Measure the learning progress of the classroom with real-time individual and groupal evaluations.</p>
            {renderIf(canEdit)(() =>
              <div>
                <hr />
                <p>Schedule an evaluation:</p>
                <Button bsStyle="primary" bsSize="small" onClick={this.createEvaluation}>
                  <Icon style={styles.icon} name="plus" /> Create evaluation
                </Button>
              </div>
            )}
          </Panel>
        </Col>
      </div>
    );
  }
}

export default withRouter(InstanceEvaluations);

const styles = {
  container: {

  },
  cell: {
    marginLeft: 25,
  },
  icon: {
    marginRight: 7,
  },
  title: {
    marginBottom: 22,
  },
  text: {
    marginBottom: 3,
  },
};
