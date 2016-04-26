import React, { Component } from 'react';
import { Panel, Row, Col, Button, Glyphicon } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import app from '../../app';

const evaluationService = app.service('/evaluations');


export default class CourseStudents extends Component {

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

  render() {
    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12} md={8}>
            {this.state.evaluations.map((evaluation, i) => (
              <p key={i}>{evaluation}</p>
            ))}
            {renderIf(this.state.evaluations.length === 0)(() => (
              <p>This course has no evaluations yet.</p>
            ))}
          </Col>
          <Col xs={12} md={4}>
            <Panel>
              <h5>Evaluations</h5>
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
};
