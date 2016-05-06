import React, { Component } from 'react';
import {
  Grid,
  Col,
  Row,
  Breadcrumb,
} from 'react-bootstrap';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';
// import Icon from 'react-fa';

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

  static get propTypes() {
    return {
      // React Router
      params: React.PropTypes.object,
      location: React.PropTypes.object,
      children: React.PropTypes.any,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      organization: null,
      course: props.params.course,
      instances: [],
      instance: -1, // index
    };
    this.fetchOrganization = this.fetchOrganization.bind(this);
  }

  componentDidMount() {
    // Fetch organization
    // const query = this.props.location.query;
    const course = this.state.course;
    this.fetchOrganization(course.organizationId);
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

  render() {
    const { course, organization } = this.state;

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
          <Breadcrumb.Item onClick={() => browserHistory.push(`/organizations/show/${organization.id}/courses`)}>
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
          {renderIf(this.props.children)(() => (
            React.cloneElement(this.props.children, { organization, course })
          ))}
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
