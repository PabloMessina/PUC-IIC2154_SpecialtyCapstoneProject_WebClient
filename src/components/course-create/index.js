import React, { Component } from 'react';
import {
  Button,
  Grid,
  Row,
  Col,
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  Alert,
  Breadcrumb,
} from 'react-bootstrap';
import Icon from 'react-fa';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import app from '../../app';

const courseService = app.service('/courses');

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class CourseCreate extends Component {

  static get propTypes() {
    return {
      name: React.PropTypes.string,
      description: React.PropTypes.string,
      // From react-router
      params: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      name: '',
      description: '',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      description: this.props.description,
      organization: props.params.organization,
      error: null,
      submiting: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const organization = nextProps.params.organization;
    if (organization && organization.id !== this.state.organization.id) {
      this.setState({ organization });
    }
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({ submiting: true, didSubmit: true });

    const options = {
      name: this.state.name,
      description: this.state.description,
      organizationId: this.state.organization.id,
    };

    return courseService.create(options)
      .then(course => browserHistory.push(`/courses/show/${course.id}`))
      .catch(err => this.setState({ submiting: false, error: err }));
  }

  render() {
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
          <Breadcrumb.Item onClick={() => browserHistory.push(`/organizations/show/${organization.id}/courses`)}>
            Courses
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            Create
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={7}>
            <h2>New Course</h2>
          </Col>
        </Row>

        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={7}>
            <p>Take a group of people from your organization and assing them evaluations and a bibliography of atlases to read.</p>
            <ul>
              <li>Create individual or group evaluations.</li>
              <li>Schedule evaluations or make a surprise quiz.</li>
              <li>Trace the performance of your students.</li>
            </ul>

            <hr />

            {renderIf(this.state.error)(() =>
              <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
                <h4>Oh snap! You got an error!</h4>
                <p>{this.state.error.message}</p>
              </Alert>
            )}

            <form onSubmit={this.onSubmit}>

              <FormGroup controlId="name">
                <ControlLabel>Course name</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.name}
                  placeholder="Introduction to Psicology"
                  label="Organization name"
                  onChange={e => this.setState({ name: e.target.value })}
                />
                <FormControl.Feedback />
              </FormGroup>

              <FormGroup controlId="description">
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={this.state.description}
                  placeholder="Course description..."
                  onChange={e => this.setState({ description: e.target.value })}
                />
              </FormGroup>

              <hr />

              <Button bsStyle="primary" type="submit" disabled={this.state.submiting}>
                Create Course
              </Button>

            </form>
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
  icon: {
    marginRight: 7,
  },
};
