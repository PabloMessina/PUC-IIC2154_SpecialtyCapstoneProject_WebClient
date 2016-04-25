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
    this.fetch = this.fetch.bind(this);
    this.createEvaluation = this.createEvaluation.bind(this);
    this.fetch(props.params.courseId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params && nextProps.params.courseId) {
      this.fetch(nextProps.params.courseId);
    }
  }

  createEvaluation() {
    const url = `/courses/show/${this.props.params.coursesId}/evaluations/create`;
    return browserHistory.push(url);
  }

  fetch(courseId) {
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
