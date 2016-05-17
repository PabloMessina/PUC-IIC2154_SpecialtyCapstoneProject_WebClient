import React, { Component } from 'react';
import { Panel, Row, Col, Button } from 'react-bootstrap';
import Icon from 'react-fa';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import moment from 'moment';
import app, { currentUser } from '../../../app';

const evaluationService = app.service('/evaluations');
const membershipService = app.service('/memberships');


export default class InstanceEvaluations extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      instance: React.PropTypes.object,
      participant: React.PropTypes.object,
      membership: React.PropTypes.object,
      // React Router
      params: React.PropTypes.object,
      evaluations: React.PropTypes.array,
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
      permission: '',
    };
    this.renderRow = this.renderRow.bind(this);
    this.createEvaluation = this.createEvaluation.bind(this);
    this.fetchEvaluations = this.fetchEvaluations.bind(this);
    this.onEvaluationClick = this.onEvaluationClick.bind(this);
    this.membership = this.membership.bind(this);
  }

  componentDidMount() {
    // Fetch organization
    // const query = this.props.location.query;
    const instance = this.props.instance;
    this.fetchEvaluations(instance.id);
    this.membership();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.instance) {
      this.fetchEvaluations(nextProps.instance.id);
    }
  }

  onEvaluationClick(evaluation) {
    const url = `/evaluations/show/${evaluation.id}`;
    return browserHistory.push(url);
  }

  createEvaluation() {
    const instanceId = this.props.instance.id;
    const userId = currentUser().id;
    return evaluationService.create({ userId, instanceId })
      .then(evaluation => {
        const url = `/evaluations/show/${evaluation.id}`;
        return browserHistory.push(url);
      });
  }

  fetchEvaluations(instanceId) {
    const query = {
      instanceId,
    };
    return evaluationService.find({ query })
      .then(result => result.data)
      .then(evaluations => this.setState({ evaluations }));
  }

  membership() {
    const user = currentUser();
    const userId = user.id;
    membershipService.find({ query: { userId } })
    .then(results => {
      this.setState({ permission: results.data.permission });
    });
  }

  renderRow(evaluation, i) {
    return (
      <div key={i} style={styles.cell}>
        <h5 style={{ cursor: 'pointer' }} onClick={() => this.onEvaluationClick(evaluation)}>
          {moment(evaluation.startAt).format('dddd, MMMM Do, h:mm a')}
        </h5>
        <p style={styles.text}>{evaluation.title}</p>
        <p style={styles.text}>
          Duration: {evaluation.duration / 60000} minutes
        </p>
        <hr />
      </div>
    );
  }

  render() {
    const participant = this.props.participant;
    const evaluations = this.state.evaluations;
    const sections = {
      soon: [],
      future: [],
      done: [],
    };

    // sorted quizes
    evaluations.forEach((evaluation) => {
      // after a week is in in 'soon' heather
      if (moment(evaluation.startAt).isAfter(moment().add(7, 'd'))) {
        sections.future.push(evaluation);

      // before soon and after now is in 'ready' heather
      } else if
        (moment(evaluation.startAt).isBefore(moment().add(7, 'd')) || moment(evaluation.startAt).isAfter(moment())) {
        sections.soon.push(evaluation);

      // enden before now is in 'done' heather
      } else if (moment(evaluation.finishAt).isBefore(moment())) {
        sections.done.push(evaluation);
      }
    });

    return (
      <div style={styles.container}>
        <Row style={styles.seccion}>
          <Col xs={12} md={8}>
            <h4 style={styles.title}>Coming Soon</h4>
            {sections.soon.map(this.renderRow)}
            {renderIf(sections.soon.length === 0)(() => (
              <div>
                <p>There are no evaluations coming soon</p>
                <hr />
              </div>
            ))}

            <h4 style={styles.title}>Future Quizzes</h4>
            {sections.future.map(this.renderRow)}
            {renderIf(sections.future.length === 0)(() => (
              <div>
                <p>There are no future evaluations</p>
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
              <h5><Icon style={styles.icon} size="lg" name="lightbulb-o" /> Evaluations</h5>
              <hr />
              <p>Measure the learning progress of the classroom with real-time individual and groupal evaluations.</p>
              {renderIf(['admin', 'write'].includes(participant.permission))(() =>
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

        </Row>
      </div>
    );
  }
}

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
