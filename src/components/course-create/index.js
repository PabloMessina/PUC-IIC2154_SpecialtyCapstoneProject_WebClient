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
  HelpBlock,
  Breadcrumb,
} from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import Select from 'react-select';
import ErrorAlert from '../error-alert';

import app from '../../app';

const courseService = app.service('/courses');
const instanceService = app.service('/instances');

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

class CourseCreate extends Component {

  static get propTypes() {
    return {
      name: React.PropTypes.string,
      description: React.PropTypes.string,
      // From react-router
      params: React.PropTypes.object,
      router: React.PropTypes.object,
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
      instances: [],
      error: null,
      submiting: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onInstanceChange = this.onInstanceChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const organization = nextProps.params.organization;
    if (organization && organization.id !== this.state.organization.id) {
      this.setState({ organization });
    }
  }

  onInstanceChange(value, instances) {
    this.setState({ instances });
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({ submiting: true, didSubmit: true });

    const options = {
      name: this.state.name,
      description: this.state.description,
      organizationId: this.state.organization.id,
    };

    // Create course
    return courseService.create(options)
      .then(course => {
        const instances = this.state.instances;
        const courseId = course.id;

        // Create all the instances
        const promises = instances
          .map(obj => obj.value)
          .map(period => instanceService.create({ period, courseId }));

        // Run operations in parallel
        return Promise.all(promises)
          .then(() => this.props.router.push(`/courses/show/${courseId}`));
      })
      .catch(error => this.setState({ submiting: false, error }));
  }

  render() {
    const organization = this.state.organization;

    return (
      <Grid style={styles.container}>

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
            Create
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          <Col xsOffset={0} xs={12} mdOffset={1} md={7}>
            <h2>New Course</h2>
          </Col>
        </Row>

        <Row>
          <Col xsOffset={0} xs={12} mdOffset={1} md={7} style={{ marginBottom: 20 }}>
            <p>
              Take a group of people from your organization and assing them evaluations
              and a bibliography of atlases to read.
            </p>
            <ul>
              <li>Create individual or group evaluations.</li>
              <li>Schedule evaluations or make a surprise quiz.</li>
              <li>Trace the performance of your students.</li>
            </ul>

            <ErrorAlert
              error={this.state.error}
              onDismiss={() => this.setState({ error: null })}
            />

            <hr />

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

              <FormGroup controlId="instances">
                <ControlLabel>Instances</ControlLabel>
                <p>
                  You may want to reutilize content of this course, so you can create instances of it for purposes like:
                </p>
                <ul>
                  <li>Different periods of times likes semesters or summer camps.</li>
                  <li>Different sections of the same course.</li>
                </ul>
                <p>
                  Add any ammout of sections, make sure to have different names.
                </p>
                <Select
                  multi
                  allowCreate
                  onBlur={e => {
                    const value = e.target.value;
                    if (value && value.length) {
                      // We just follow the format of labels of the component
                      const instances = [...this.state.instances, {
                        create: true,
                        label: value,
                        value,
                      }];
                      this.setState({ instances });
                    }
                  }}
                  addLabelText={'Add instance: {label}'}
                  noResultsText="Type and add a instance with any name"
                  value={this.state.instances}
                  options={[]}
                  onChange={this.onInstanceChange}
                  placeholder={'Summer 2016, Fall 2016'}
                />
                <HelpBlock>
                  You can skip this for now.
                </HelpBlock>
              </FormGroup>

              <hr />

              <Button bsStyle="primary" type="submit" disabled={this.state.submiting}>
                Create Course
              </Button>

            </form>
          </Col>

          <Col xsOffset={0} xs={12} md={3}>
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

export default withRouter(CourseCreate);
