import React, { PropTypes, Component } from 'react';
import { Grid, Col, Panel, Button, Glyphicon } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';
import CourseList from '../course-list/';

import app from '../../app';
const courseService = app.service('/courses');

export default class CourseTab extends Component {

  static get propTypes() {
    return {
      organization: PropTypes.object,
      membership: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      courses: [],
    };
    this.onCreateCourse = this.onCreateCourse.bind(this);
    this.fetchCourses = this.fetchCourses.bind(this);
  }

  componentDidMount() {
    this.fetchCourses(this.props.organization.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.organization) {
      this.fetchCourses(nextProps.organization.id);
    }
  }

  onCreateCourse() {
    const url = `/organizations/show/${this.props.organization.id}/courses/create`;
    return browserHistory.push(url);
  }

  fetchCourses(organizationId) {
    const query = {
      organizationId,
    };
    return courseService.find({ query })
    .then(result => result.data)
    .then(courses => this.setState({ courses }));
  }

  render() {
    const { courses } = this.state;
    const { membership } = this.props;

    return (
      <Grid style={styles.container}>

        <Col xs={12} md={9}>
          <CourseList courses={courses} />
        </Col>
        <Col xs={12} md={3}>
          <Panel>
            <h4>Courses</h4>
            <p>Each course is a group of students and teachers working together.</p>
            {renderIf(['admin', 'write'].includes(membership.permission))(() =>
              <div>
                <hr />
                <p>Want to share knowledge?</p>
                <Button bsStyle="primary" bsSize="small" onClick={this.onCreateCourse}>
                  <Glyphicon glyph="plus" /> Create course
                </Button>
              </div>
            )}
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
