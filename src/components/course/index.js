import React, { Component } from 'react';
import { Grid, Col, Row, ListGroup, ListGroupItem, Breadcrumb } from 'react-bootstrap';
import { browserHistory } from 'react-router';

import app from '../../app';

const courseService = app.service('/courses');
const organizationService = app.service('/organizations');

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      organization: null,
      course: null,
      elements: [
        {
          name: 'Evaluations',
          path: 'evaluations',
        }, {
          name: 'Students',
          path: 'students',
        }, {
          name: 'Analytics',
          path: 'analytics',
        },
      ],
    };
    this.fetchCourse = this.fetchCourse.bind(this);
    this.fetchOrganization = this.fetchOrganization.bind(this);
    this.fetchCourse(props.params.courseId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params && nextProps.params.courseId) {
      this.fetchCourse(nextProps.params.courseId);
    }
  }

  fetchCourse(courseId) {
    return courseService.get(courseId)
      .then(course => {
        this.setState({ course });
        return course;
      })
      .then(course => this.fetchOrganization(course.organizationId));
  }

  fetchOrganization(organizationId) {
    return organizationService.get(organizationId)
      .then(organization => this.setState({ organization }));
  }

  renderListElement(element, i) {
    const url = `/courses/show/${this.props.params.courseId}/${element.path}`;
    return (
      <ListGroupItem key={i} onClick={() => browserHistory.push(url)}>
        {element.name}
      </ListGroupItem>
    );
  }

  render() {
    const { course } = this.state;
    if (!course) return <p>Loading...</p>;

    const { name, description } = course;

    return (
      <Grid style={styles.container}>

        <br />

        <Breadcrumb>
          <Breadcrumb.Item>
            Organizations
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => browserHistory.push(`/organizations/show/${this.state.organization.id}`)}>
            {this.state.organization ? this.state.organization.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            Courses
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {name}
          </Breadcrumb.Item>
        </Breadcrumb>

        <h1 style={styles.title}>{name}</h1>
        <p>{description}</p>

        <hr />

        <Row>
          <Col xs={12} sm={6} md={3}>
            <ListGroup>
              {this.state.elements.map((element, i) => this.renderListElement(element, i))}
            </ListGroup>
          </Col>

          <Col xs={12} sm={6} md={9}>
           {this.props.children}
          </Col>
        </Row>
      </Grid>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
Course.propTypes = {
  children: React.PropTypes.any,
  // React Router
  params: React.PropTypes.object,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
  title: {
    marginTop: 30,
    marginBottom: 25,
  },
};
