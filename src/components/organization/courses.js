import React, { PropTypes, Component } from 'react';
import { Grid, Col, Panel, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';
import renderIf from 'render-if';
import Icon from 'react-fa';

import app from '../../app';
const courseService = app.service('/courses');

import CourseList from '../course-list/';


class CourseTab extends Component {

  static propTypes = {
    organization: PropTypes.object,
    membership: PropTypes.object,
    router: PropTypes.object,
  }

  state = {
    courses: [],
  }

  componentDidMount() {
    this.fetchCourses(this.props.organization);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.organization) {
      this.fetchCourses(nextProps.organization);
    }
  }

  onCreateCourse = () => {
    const url = `/organizations/show/${this.props.organization.id}/courses/create`;
    return this.props.router.push(url);
  }

  fetchCourses = (organization) => {
    const query = {
      organizationId: organization.id || organization,
    };
    return courseService.find({ query })
      .then(result => result.data)
      .then(courses => courses.map(c => ({ ...c, organization })))
      .then(courses => this.setState({ courses }));
  }

  render() {
    const { courses } = this.state;
    const { membership } = this.props;

    const canEdit = membership && ['admin', 'write'].includes(membership.permission);

    return (
      <Grid style={styles.container}>
        <Col xs={12} md={9}>
          <CourseList courses={courses} />
        </Col>
        <Col xs={12} md={3}>
          <Panel>
            <h4>Courses</h4>
            <p>Each course is a group of students and teachers working together.</p>
            {renderIf(canEdit)(() =>
              <div>
                <hr />
                <p>Want to share knowledge?</p>
                <Button bsStyle="primary" bsSize="small" onClick={this.onCreateCourse}>
                  <Icon name="plus" style={styles.icon} /> Create course
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
  icon: {
    marginRight: 7,
  },
};

export default withRouter(CourseTab);
