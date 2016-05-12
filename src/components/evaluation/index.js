import React, { Component } from 'react';
import { Grid, Row, Col, ButtonGroup, Button, Breadcrumb } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import app from '../../app';
const organizationService = app.service('/organizations');
const courseService = app.service('/courses');
const instanceService = app.service('/instances');
const evaluationService = app.service('/evaluations');

const SECTIONS = [
  {
    name: 'Information',
    description: 'Evaluation terms and date',
    path: 'description',
  },
  {
    name: 'Students',
    description: 'Participants and groups',
    path: 'students',
  },
  {
    name: 'Questions',
    description: 'List of questions',
    path: 'questions',
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
      // Main object
      evaluation: React.PropTypes.object,
      // Defaults
      questions: React.PropTypes.array,
      groups: React.PropTypes.array,
      users: React.PropTypes.array,
      attendants: React.PropTypes.array,
      answers: React.PropTypes.object,
      // React Router
      params: React.PropTypes.object,
      children: React.PropTypes.any,
      location: React.PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      users: [
       { id: 3, name: 'Bobadilla Felipe' },
       { id: 0, name: 'Lopez Patricio' },
       { id: 1, name: 'Andrighetti Tomas' },
       { id: 9, name: 'Steinsapir Diego' },
       { id: 8, name: 'Monsalve Geraldine' },
       { id: 2, name: 'Astaburuaga Francisco' },
       { id: 5, name: 'Dragicevic Vicente' },
       { id: 6, name: 'Halabi Maria Constanza' },
       { id: 7, name: 'Messina Pablo' },
       { id: 4, name: 'Bustamante Jose' },
      ],
      questions: [],
      answers: {},
      groups: [[]],
      attendants: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tabStates: Array(SECTIONS.length).fill('default'),
      organization: null,
      course: null,
      // Current evaluation
      evaluation: props.params.evaluation,
      users: props.users,
      questions: props.questions,
      groups: props.groups,
      answers: props.answers,
      attendants: props.attendants,
    };

    this.renderSection = this.renderSection.bind(this);

    this.fetchOrganization = this.fetchOrganization.bind(this);
    this.fetchCourse = this.fetchCourse.bind(this);
    this.fetchInstance = this.fetchInstance.bind(this);

    this.onEvaluationChange = this.onEvaluationChange.bind(this);
    this.onQuestionsChange = this.onQuestionsChange.bind(this);
    this.onGroupsChange = this.onGroupsChange.bind(this);
    this.onAttendantsChange = this.onAttendantsChange.bind(this);
    this.onAnswerChange = this.onAnswerChange.bind(this);
    this.onFieldsChange = this.onFieldsChange.bind(this);
    this.onQuestionAdd = this.onQuestionAdd.bind(this);
    this.onQuestionRemove = this.onQuestionRemove.bind(this);
    this.onSubmitDescription = this.onSubmitDescription.bind(this);
  }

  componentDidMount() {
    const instanceId = this.state.evaluation.instanceId;
    return this.fetchInstance(instanceId)
      .then(instance => this.fetchCourse(instance.courseId))
      .then(course => this.fetchOrganization(course.organizationId));
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const course = nextProps.params.course;
    if (course && course.id !== this.state.course.id) {
      this.setState({ course });
      this.fetchOrganization(course.organizationId);
    }
  }

  onEvaluationChange(evaluation) {
    if (evaluation) {
      this.setState({ evaluation: { ...this.state.evaluation, ...evaluation } });
    }
  }

  onQuestionsChange(questions) {
    if (questions) this.setState({ questions });
  }

  onGroupsChange(groups) {
    if (groups) this.setState({ groups });
  }

  onAttendantsChange(attendants) {
    if (attendants) this.setState({ attendants });
  }

  onAnswerChange(id, answer) {
    if (id) {
      const answers = { ...this.state.answers, [id]: answer };
      this.setState({ answers });
    }
  }

  onFieldsChange(id, fields) {
    if (id) {
      const questions = this.state.questions;
      const index = this.state.question.findIndex(q => q.id === id);
      if (index > -1) questions[index].fields = fields;
      this.setState({ questions });
    }
  }

  onQuestionAdd(question) {
    if (question) this.setState({ questions: [...this.state.questions, question] });
  }

  onQuestionRemove(question) {
    if (question) {
      const questions = this.state.questions.filter(q => q.id !== question.id);
      this.setState({ questions });
    }
  }

  onSubmitDescription() {
    const evaluation = this.state.evaluation;
    return evaluationService
      .patch(evaluation.id, { ...evaluation, id: undefined })
      .catch(err => {
        console.log(err);
      });
  }

  fetchCourse(courseId) {
    return courseService.get(courseId)
      .then(course => {
        this.setState({ course });
        return course;
      });
  }

  fetchInstance(instanceId) {
    return instanceService.get(instanceId)
      .then(instance => {
        this.setState({ instance });
        return instance;
      });
  }

  fetchOrganization(organizationId) {
    return organizationService.get(organizationId)
      .then(organization => {
        this.setState({ organization });
        return organization;
      });
  }

  renderSections() {
    return (
      <ButtonGroup justified>
        {SECTIONS.map(this.renderSection)}
      </ButtonGroup>
    );
  }

  renderSection(section, i) {
    const evaluation = this.state.evaluation;
    const { name, description, path } = section;
    const paths = this.props.location.pathname.split('/');
    const active = paths[paths.length - 1];
    const url = `/evaluations/show/${evaluation.id}/${path}`;

    return (
      <Button
        style={styles.tab}
        key={i}
        href="#"
        active={path === active}
        bsStyle={this.state.tabStates[i]}
        onClick={() => browserHistory.push(url)}
      >
        <h5 style={styles.tabTitle}>{name}</h5>
        <small style={styles.tabDescription}>{description}</small>
      </Button>
    );
  }

  render() {
    const { course, instance, organization, evaluation, users, questions, answers, groups, attendants } = this.state;

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
          <Breadcrumb.Item onClick={() => browserHistory.push(`/courses/show/${course.id}`)}>
            {course ? course.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => browserHistory.push(`/courses/show/${course.id}/instances/${instance.id}`)}>
            {instance ? instance.period : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item
            onClick={() => browserHistory.push(`/courses/show/${course.id}/instances/${instance.id}/evaluations`)}
          >
            Evaluations
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {evaluation.title}
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          <Col xs={12} md={9}>
            <h2>
              Evaluation
              {renderIf(this.state.evaluation && this.state.evaluation.title)(() => (
                <small style={{ marginLeft: 4 }}> {this.state.evaluation.title}</small>
              ))}
            </h2>
            {/*
            {renderIf(this.state.evaluation && this.state.evaluation.description)(() => (
              <p style={{ marginLeft: 4 }}> {this.state.evaluation.description}</p>
            ))}
            */}
          </Col>
        </Row>


        <Row>
          <Col style={styles.bar} xsOffset={0} xs={12}>
            {this.renderSections()}
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            {renderIf(course && instance && organization)(() =>
              React.cloneElement(this.props.children, {
                organization,
                course,
                instance,
                evaluation,
                users,
                questions,
                answers,
                groups,
                attendants,
                onQuestionAdd: this.onQuestionAdd,
                onQuestionRemove: this.onQuestionRemove,
                onEvaluationChange: this.onEvaluationChange,
                onQuestionsChange: this.onQuestionsChange,
                onGroupsChange: this.onGroupsChange,
                onAttendantsChange: this.onAttendantsChange,
                onAnswerChange: this.onAnswerChange,
                onFieldsChange: this.onFieldsChange,
                onSubmitDescription: this.onSubmitDescription,
              })
            )}
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
