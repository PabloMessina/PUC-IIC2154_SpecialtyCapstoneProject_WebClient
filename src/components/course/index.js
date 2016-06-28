import React, { Component } from 'react';
import {
  Grid,
  Col,
  Row,
  Breadcrumb,
} from 'react-bootstrap';
import { withRouter } from 'react-router';
import renderIf from 'render-if';
import DocumentTitle from 'react-document-title';

import app from '../../app';
const instanceService = app.service('/instances');

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

class Course extends Component {

  static get propTypes() {
    return {
      // React Router
      params: React.PropTypes.object,
      location: React.PropTypes.object,
      router: React.PropTypes.object,
      children: React.PropTypes.any,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      organization: props.params.course.organization,
      course: props.params.course,
      instances: props.params.course.instances || [],
      instance: -1, // index
    };
    this.observe = this.observe.bind(this);
  }

  componentDidMount() {
    const { course } = this.state;
    this.observe(course);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const course = nextProps.params.course;
    if (course && course.id !== this.state.course.id) {
      this.setState({ course, organization: course.organization, instances: course.instances || [] });
      this.observe(course);
    }
  }

  componentWillUnmount() {
    if (this.observer) this.observer.unsubscribe();
  }

  observe(course) {
    const query = {
      courseId: course.id || course,
    };
    this.observer = instanceService.find({ query }).map(result => result.data)
      .subscribe(instances => this.setState({ instances }));
    return this.observer;
  }

  render() {
    const { organization, course, instances } = this.state;

    return (
      <Grid style={styles.container}>
        <DocumentTitle title={course.name} />
        <br />

        <Breadcrumb>
          <Breadcrumb.Item active>
            Organizations
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => this.props.router.push(`/organizations/show/${organization.id}`)}>
            {organization ? organization.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => this.props.router.push(`/organizations/show/${organization.id}/courses`)}>
            Courses
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {course.name}
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          <Col xs={12} md={9}>
            <h2 style={styles.title} style={styles.header}>
              <span>{course.name}</span>
            </h2>
            <p>{course.description}</p>
          </Col>
        </Row>

        <br />

        <div style={styles.content}>
          {renderIf(this.props.children)(() =>
            React.cloneElement(this.props.children, { organization, course, instances })
          )}
        </div>

      </Grid>
    );
  }
}

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    // marginTop: 30,
    // marginBottom: 25,
  },
  icon: {
    marginRight: 7,
  },
};

export default withRouter(Course);
