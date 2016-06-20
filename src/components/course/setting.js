/* eslint no-alert: 0 */

import React, { Component } from 'react';
import { Row, Col, Grid, Button, Table, Panel } from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';

import app from '../../app';
const instanceService = app.service('/instances');
const courseService = app.service('/courses');

class CourseSettings extends Component {

  static get propTypes() {
    return {
      instances: React.PropTypes.array,
      course: React.PropTypes.object,
      router: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      instances: [],
      error: '',
    };
    this.onDeleteInstance = this.onDeleteInstance.bind(this);
    this.onDeleteCourse = this.onDeleteCourse.bind(this);
    this.fetchInstances = this.fetchInstances.bind(this);
  }

  componentDidMount() {
    this.fetchInstances();
  }

  onDeleteInstance(instance) {
    if (window.confirm('Do you really want to delete this course instance?')) {
      return instanceService.remove(instance.id)
        .then(() => this.fetchInstances());
    }
    return false;
  }

  onDeleteCourse() {
    if (window.confirm('Do you really want to delete the entire course?')) {
      return courseService.remove(this.props.course.id)
        .then(() => this.props.router.push(`/organizations/show/${this.props.course.organizationId}/courses`));
    }
    return false;
  }

  fetchInstances() {
    const query = {
      id: this.props.course.id,
      $populate: 'instance',
    };
    return courseService.find({ query })
      .then(result => result.data[0])
      .then(course => this.setState({ instances: course.instances }))
      .catch(error => this.setState({ error }));
  }

  render() {
    return (
      <Grid style={styles.container}>
        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={8}>
            <h2>Delete Course or Instances</h2>
            <p>Delete instance of a course</p>
            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>Instance</th>
                  {/* <th>Students</th> */}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
              {this.state.instances.map((instance, i) => (
                <tr key={i}>
                  <td>{instance.period}</td>
                  {/* <td>quantity</td> */}
                  <td>
                    <Button bsStyle="danger" onClick={() => this.onDeleteInstance(instance)}>
                      Remove instance
                    </Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
            <hr />
            <p>Delete course and all its content</p>
            <Button bsStyle="danger" onClick={() => this.onDeleteCourse()}>
              Remove course
            </Button>
          </Col>
          <Col xsOffset={0} xs={12} sm={3}>
            <Panel>
              <h5><Icon style={styles.icon} size="lg" name="info-circle" /> Need help?</h5>
              <hr />
              <p>Take a look at our showcase or contact us.</p>
            </Panel>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
};

export default withRouter(CourseSettings);
