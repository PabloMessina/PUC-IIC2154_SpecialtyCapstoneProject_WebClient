import React, { Component } from 'react';
import { Grid, Row, Col, Panel, Button, Glyphicon } from 'react-bootstrap';
import { browserHistory } from 'react-router';

import CourseList from '../course-list/';

import app from '../../app';
const courseService = app.service('/courses');

export default class CourseTab extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      courses: [],
    };
    this.createCourse = this.createCourse.bind(this);
    this.fetch = this.fetch.bind(this);
    this.fetch(this.props.organization.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.organization) {
      this.fetch(nextProps.organization.id);
    }
  }

  fetch(organizationId) {
    const query = {
      organizationId,
    };
    return courseService.find({ query })
      .then(result => result.data)
      .then(courses => this.setState({ courses }));
  }

  createCourse() {
    const url = `/organizations/show/${this.props.organization.id}/courses/create`;
    return browserHistory.push(url);
  }

  render() {
    return (
      <Grid style={styles.container}>

        <Col xs={12} md={9}>
          <CourseList courses={this.state.courses} />
        </Col>

        {/* TODO: delete this button list */}
        <Col xs={12} md={9}>
          {this.state.courses.map((course, i) => (
            <Button key={i} onClick={() => browserHistory.push(`/courses/show/${course.id}`)}>{course.name}</Button>
          ))}
        </Col>

        <Col xs={12} md={3}>
          <Panel>
            <h4>Courses</h4>
            <p>Each course is a group of students and teachers working together.</p>
            <hr />
            <p>Want to share knowledge?</p>
            <Button bsStyle="primary" bsSize="small" onClick={this.createCourse}>
              <Glyphicon glyph="plus" /> Create course
            </Button>
          </Panel>

        </Col>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
};
