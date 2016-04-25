import React, { Component } from 'react';
import { Grid, Row, Col, ButtonGroup, Button, Breadcrumb } from 'react-bootstrap';
import { browserHistory } from 'react-router';

import app from '../../app';

const courseService = app.service('/courses');

const SECTIONS = [
  {
    name: 'Information',
    description: 'Evaluation terms and date',
    path: 'description',
  },
  {
    name: 'Questions',
    description: 'List of questions',
    path: 'questions',
  },
  {
    name: 'Students',
    description: 'Participants and groups',
    path: 'students',
  },
  {
    name: 'Results',
    description: 'Answers and results',
    path: 'results',
  },
  {
    name: 'Recorrection',
    description: 'Problems reported',
    path: 'recorrection',
  },
];

export default class EvaluationCreate extends Component {

  static get propTypes() {
    return {
      // React Router
      params: React.PropTypes.object,
      children: React.PropTypes.any,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      tabStates: Array(SECTIONS.length).fill('default'),
      course: null,
    };
    this.renderSection = this.renderSection.bind(this);
    this.fetchCourse = this.fetchCourse.bind(this);
    this.fetchCourse(this.props.params.courseId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params && nextProps.params.courseId) {
      this.fetchCourse(nextProps.params.courseId);
    }
  }

  fetchCourse(courseId) {
    return courseService.get(courseId)
      .then(course => this.setState({ course }));
  }

  renderSection(section, i) {
    const { name, description, path } = section;
    const url = `/courses/show/${this.props.params.courseId}/evaluations/create/${path}`;
    return (
      <Button
        style={styles.tab}
        key={i}
        href="#"
        active={this.state.selected === i}
        bsStyle={this.state.tabStates[i]}
        onClick={() => {
          this.setState({ selected: i });
          browserHistory.push(url);
        }}
      >
        <h5 style={styles.tabTitle}>{name}</h5>
        <small style={styles.tabDescription}>{description}</small>
      </Button>
    );
  }

  render() {
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
          <Breadcrumb.Item onClick={() => browserHistory.push(`/courses/show/${this.state.course.id}`)}>
            {this.state.course ? this.state.course.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            Evaluations
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            Create
          </Breadcrumb.Item>
        </Breadcrumb>

        <h2>Evaluation</h2>
        <Row>
          <Col style={styles.bar} xsOffset={0} xs={12}>
            <ButtonGroup justified>
              {SECTIONS.map((section, i) => this.renderSection(section, i))}
            </ButtonGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            {this.props.children}
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
  bar: {
    marginTop: 15,
  },
  tab: {
    fontSize: 14,
    lineHeight: 1,
    verticalAlign: 'top',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    paddingBottom: 12,
  },
  tabTitle: {
    marginTop: 4,
    marginBottom: 2,
  },
  tabDescription: {

  },
};
