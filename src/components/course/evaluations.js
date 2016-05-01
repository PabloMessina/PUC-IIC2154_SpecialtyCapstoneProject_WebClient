import React, { Component } from 'react';
import { Panel, Row, Col, Button, Glyphicon } from 'react-bootstrap';
import Icon from 'react-fa';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import moment from 'moment';
import app from '../../app';

const evaluationService = app.service('/evaluations');


export default class CourseEvaluations extends Component {

  static get propTypes() {
    return {
      // React Router
      params: React.PropTypes.object,
      course: React.PropTypes.object,
      organization: React.PropTypes.object,
      evaluations: React.PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      evaluations: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      evaluations: props.evaluations,
    };
    this.renderRow = this.renderRow.bind(this);
    this.createEvaluation = this.createEvaluation.bind(this);
    this.fetchEvaluation = this.fetchEvaluation.bind(this);
    this.fetchEvaluation(props.course.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.course) {
      this.fetchEvaluation(nextProps.course.id);
    }
  }

  createEvaluation() {
    const url = `/courses/show/${this.props.course.id}/evaluations/create`;
    return browserHistory.push(url);
  }

  fetchEvaluation(courseId) {
    const query = {
      courseId,
    };
    return evaluationService.find({ query })
      .then(result => result.data)
      .then(evaluations => this.setState({ evaluations }));
  }

  renderRow(evaluation, i) {
    return (
      <p key={i}>{evaluation}</p>
    );
  }

  render() {
    const evaluations = this.state.evaluations;
    const sections = {
      ready: [],
      soon: [],
      done: [],
    };

    // sorted quizes
    evaluations.forEach((evaluation) => {
      // after a week is in in 'soon' heather
      if (moment(evaluation.startAt).isAfter(moment().add(7, 'd'))) {
        sections.soon.push(evaluation);
      } else if (moment(evaluation.startAt).isAfter(moment())) {
        // before soon and after now is in 'ready' heather
        sections.ready.push(evaluation);
      } else if (moment(evaluation.finishAt).isBefore(moment())) {
        // enden before now is in 'done' heather
        sections.done.push(evaluation);
      }
    });
    return (
      <div style={styles.container}>
        <Row style={styles.seccion}>
          <Col xs={12} md={8}>
            <h4 style={styles.title} size="lg" name="lightbulb-o"> Coming Soon</h4>
            {sections.ready.map((evaluation, i) => (
              <div key={i}>
                <h5 size="lg" name="lightbulb-o">{moment(evaluation.startAt).format('dddd, MMMM Do, h:mm a')}</h5>
                <p style={styles.text}>{evaluation.title}</p>
                <p style={styles.text}>
                  Duration: {moment(evaluation.finishAt).diff(evaluation.startAt, 'minutes')} minutes
                </p>
                <hr />
              </div>
            ))}
            {renderIf(sections.ready.length === 0)(() => (
              <div>
                <p>There are no evaluations coming soon</p>
                <br />
              </div>
            ))}
            <h4 style={styles.title} size="lg" name="lightbulb-o"> Future Quizzes</h4>
            {sections.soon.map((evaluation, i) => (
              <div key={i}>
                <h5 size="lg" name="lightbulb-o" >{moment(evaluation.startAt).format('dddd, MMMM Do, h:mm a')}</h5>
                <p style={styles.text}>{evaluation.title}</p>
                <p style={styles.text}>
                  Duration: {moment(evaluation.finishAt).diff(evaluation.startAt, 'minutes')} minutes
                </p>
                <hr />
              </div>
            ))}
            {renderIf(sections.soon.length === 0)(() => (
              <div>
                <p>There are no future evaluations</p>
                <br />
              </div>
            ))}
            <h4 style={styles.title} size="lg" name="lightbulb-o"> Done</h4>
            {sections.done.map((evaluation, i) => (
              <div key={i}>
                <h5 size="lg" name="lightbulb-o">{moment(evaluation.startAt).format('dddd, MMMM Do, h:mm a')}</h5>
                <p style={styles.text}>{evaluation.title}</p>
                <p style={styles.text}>
                  Duration: {moment(evaluation.finishAt).diff(evaluation.startAt, 'minutes')} minutes
                </p>
                <hr />
              </div>
            ))}
            {renderIf(sections.done.length === 0)(() => (
              <div>
                <p>There are no evaluations done</p>
                <br />
              </div>
            ))}
          </Col>
          <Col xs={12} md={4}>
            <Panel>
              <h5><Icon style={styles.icon} size="lg" name="lightbulb-o" /> Evaluations</h5>
              <hr />
              <p>Measure the learning progress of the classroom with real-time individual and groupal evaluations.</p>
              <hr />
              <p>Schedule a evaluation:</p>
              <Button bsStyle="primary" bsSize="small" onClick={this.createEvaluation}>
                <Glyphicon glyph="plus" /> Create evaluation
              </Button>
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
  icon: {
    marginRight: 7,
  },
  medium: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: 22,
  },
  text: {
    marginBottom: 3,
  },
};
