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
} from 'react-bootstrap';
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
      error: null,
      submiting: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({ submiting: true, didSubmit: true });

    const options = {
      name: this.state.name,
      description: this.state.description,
      organizationId: this.props.params.organizationId,
    };

    return courseService.create(options)
      .then(course => browserHistory.push(`/courses/show/${course.id}`))
      .catch(err => this.setState({ submiting: false, error: err }));
  }

  render() {
    return (
      <Grid style={styles.container}>
        <h2>New Course</h2>
        <Row>
          <Col xs={12} sm={8}>
            <p>Message</p>

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

              <Button bsStyle="primary" type="submit" disabled={this.state.submiting}>
                Create Course
              </Button>

            </form>
          </Col>

          <Col xs={12} sm={4}>
            <Panel>
              <h5>Looking for help?</h5>
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
