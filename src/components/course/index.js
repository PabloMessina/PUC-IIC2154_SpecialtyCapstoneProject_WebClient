import React, { Component } from 'react';
import { Grid, Col, Row, ListGroup, ListGroupItem, Breadcrumb } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import Icon from 'react-fa';

import app from '../../app';

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
      course: props.params.course,
      elements: [
        {
          name: 'Evaluations',
          icon: 'file-text-o ',
          path: 'evaluations',
        }, {
          name: 'Students',
          icon: 'users',
          path: 'students',
        }, {
          name: 'Analytics',
          icon: 'bar-chart ',
          path: 'analytics',
        },
      ],
    };
    this.fetchOrganization = this.fetchOrganization.bind(this);

    // Fetch organization
    this.fetchOrganization(this.state.course.organizationId);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const course = nextProps.params.course;
    if (course && course.id !== this.state.course.id) {
      this.setState({ course });
      this.fetchOrganization(course.organizationId);
    }
  }

  fetchOrganization(organizationId) {
    return organizationService.get(organizationId)
      .then(organization => this.setState({ organization }));
  }

  renderListElement(element, i) {
    const course = this.state.course;
    const url = `/courses/show/${course.id}/${element.path}`;
    return (
      <ListGroupItem key={i} onClick={() => browserHistory.push(url)}>
        <Icon style={styles.icon} name={element.icon} /> {element.name}
      </ListGroupItem>
    );
  }

  render() {
    const course = this.state.course;
    const organization = this.state.organization;

    return (
      <Grid style={styles.container}>

        <br />

        <Breadcrumb>
          <Breadcrumb.Item>
            Organizations
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => browserHistory.push(`/organizations/show/${organization.id}`)}>
            {organization ? organization.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            Courses
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {course.name}
          </Breadcrumb.Item>
        </Breadcrumb>

        <h1 style={styles.title}>{course.name}</h1>
        <p>{course.description}</p>

        <hr />

        <Row>
          <Col xs={12} sm={3} md={3}>
            <ListGroup>
              {this.state.elements.map((element, i) => this.renderListElement(element, i))}
            </ListGroup>
          </Col>

          <Col xs={12} sm={9} md={9}>
            {React.cloneElement(this.props.children, { course, organization })}
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
  icon: {
    marginRight: 7,
  },
};
