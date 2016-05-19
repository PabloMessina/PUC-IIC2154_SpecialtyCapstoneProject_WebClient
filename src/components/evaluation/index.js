import React, { Component } from 'react';
import { Grid, Row, Col, ButtonGroup, Button, Breadcrumb } from 'react-bootstrap';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';
import renderIf from 'render-if';

import app from '../../app';
const organizationService = app.service('/organizations');
const courseService = app.service('/courses');
const participantService = app.service('/participants');
const evaluationService = app.service('/evaluations');
const evaluationsQuestionService = app.service('/evaluations-questions');
const answerService = app.service('/answers');
const attendanceService = app.service('/attendances');

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

const MODES = [
  'instructor',
  'student',
];

class EvaluationCreate extends Component {

  static get propTypes() {
    return {
      // Main object
      evaluation: React.PropTypes.object,
      // Defaults
      questions: React.PropTypes.array,
      // groups: React.PropTypes.array,
      attendances: React.PropTypes.array,
      answers: React.PropTypes.object,
      // React Router
      router: React.PropTypes.object,
      params: React.PropTypes.object,
      children: React.PropTypes.any,
      location: React.PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      questions: [],
      answers: {},
      // groups: [[]],
      attendances: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      // Current evaluation
      evaluation: props.params.evaluation,
      // Students rending the evaluation
      users: [],
      questions: props.params.evaluation.questions || props.questions,
      // groups: props.groups,
      answers: props.answers,
      attendances: props.params.evaluation.attendances || props.attendances,
      // Other
      organization: null,
      course: null,
      instance: props.params.evaluation.instance,
      syncing: false,
      tabStates: Array(SECTIONS.length).fill('default'),
    };

    // console.log(JSON.stringify(this.state.evaluation, null, 4));
    this.renderSection = this.renderSection.bind(this);
    this.renderSections = this.renderSections.bind(this);

    this.fetchOrganization = this.fetchOrganization.bind(this);
    this.fetchCourse = this.fetchCourse.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.fetchAttendances = this.fetchAttendances.bind(this);
    this.fetchAll = this.fetchAll.bind(this);

    this.onNavigateTo = this.onNavigateTo.bind(this);
    this.onEvaluationChange = this.onEvaluationChange.bind(this);
    this.onQuestionsChange = this.onQuestionsChange.bind(this);
    // this.onGroupsChange = this.onGroupsChange.bind(this);
    // this.onAttendantsChange = this.onAttendantsChange.bind(this);
    this.onAttendanceAdd = this.onAttendanceAdd.bind(this);
    this.onAttendanceRemove = this.onAttendanceRemove.bind(this);
    this.onAttendanceUpdate = this.onAttendanceUpdate.bind(this);
    this.onAnswerChange = this.onAnswerChange.bind(this);
    this.onFieldsChange = this.onFieldsChange.bind(this);
    this.onQuestionAdd = this.onQuestionAdd.bind(this);
    this.onQuestionRemove = this.onQuestionRemove.bind(this);
    this.onSubmitDescription = this.onSubmitDescription.bind(this);
  }

  componentDidMount() {
    this.fetchAll(this.state.evaluation);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const evaluation = nextProps.params.evaluation;
    if (evaluation && evaluation.id !== this.state.evaluation.id) {
      const questions = evaluation.questions || [];
      this.setState({ evaluation, questions, instance: evaluation.instance });
      this.fetchAll(evaluation);
    }
  }

  onAttendanceAdd(attendance) {
    const attendances = [...this.state.attendances, attendance];
    this.setState({ attendances });
  }

  onAttendanceRemove(attendance) {
    const attendances = this.state.attendances.filter(a => a.id !== attendance.id);
    this.setState({ attendances });
  }

  onAttendanceUpdate(attendance) {
    const attendances = [...this.state.attendances];
    const index = attendances.findIndex(a => a.id === attendance.id);
    if (index > -1) {
      attendances[index] = attendance;
      this.setState({ attendances });
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

  onAnswerChange(id, answer) {
    const questions = this.state;
    if (id) {
      const indexQ = questions.findIndex((q) => q.id === id);
      questions[indexQ].answer = answer;
      this.setState({ answers: { ...this.state.answers, [id]: answer }, questions });
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
    if (!question) return null;
    this.setState({ syncing: true });

    const questionId = question.id;
    const evaluationId = this.state.evaluation.id;
    return evaluationsQuestionService.create({ questionId, evaluationId })
      .then(evaluationsQuestion => [...this.state.questions, { ...question, evaluationsQuestion }])
      .then(questions => this.setState({ questions, syncing: false }))
      .catch(error => this.setState({ error, syncing: false }));
  }

  onQuestionRemove(question) {
    if (!question) return null;
    this.setState({ syncing: true });

    return evaluationsQuestionService.remove(question.evaluationsQuestion.id)
      .then(() => this.state.questions.filter(q => q.id !== question.id))
      .then(questions => this.setState({ questions, syncing: false }))
      .catch(error => this.setState({ error, syncing: false }));
  }

  onSubmitDescription() {
    const evaluation = this.state.evaluation;
    return evaluationService
      .patch(evaluation.id, { ...evaluation, id: undefined })
      .catch(error => this.setState({ error }));
  }

  onNavigateTo(url) {
    this.props.router.push(url);
  }

  fetchAll(evaluation) {
    return this.fetchCourse(evaluation.instance.courseId)
      .then(course => this.fetchOrganization(course.organizationId))
      .then(() => this.fetchUsers(evaluation.instanceId))
      .catch(error => this.setState({ error }));
  }

  fetchAttendances(evaluationId) {
    const query = { evaluationId };
    return attendanceService.find(query)
      .then(result => result.data)
      .then(attendances => {
        this.setState({ attendances, error: null });
        return attendances;
      })
      .catch(error => this.setState({ error }));
  }

  fetchCourse(courseId) {
    return courseService.get(courseId)
      .then(course => {
        this.setState({ course, error: null });
        return course;
      })
      .catch(error => this.setState({ error }));
  }

  fetchUsers(instanceId) {
    const query = {
      instanceId,
      $populate: ['user'],
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => {
        const users = participants.map(p => p.user);
        this.setState({ users, error: null });
        return users;
      })
      .catch(error => this.setState({ error }));
  }

  fetchOrganization(organizationId) {
    return organizationService.get(organizationId)
      .then(organization => {
        this.setState({ organization, error: null });
        return organization;
      })
      .catch(error => this.setState({ error }));
  }

  get selected() {
    const location = this.props.location.pathname.split('/').filter(Boolean);
    const [/* evaluations */, /* show */, /* :id */, selected] = location;
    return selected;
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
    const selected = this.selected;
    const url = `/evaluations/show/${evaluation.id}/${path}`;

    return (
      <Button
        style={styles.tab}
        key={i}
        href="#"
        active={path === selected}
        bsStyle={this.state.tabStates[i]}
        onClick={() => this.props.router.push(url)}
      >
        <h5 style={styles.tabTitle}>{name}</h5>
        <small style={styles.tabDescription}>{description}</small>
      </Button>
    );
  }

  render() {
    const {
      answers,
      attendances,
      course,
      evaluation,
      instance,
      organization,
      questions,
      users,
    } = this.state;

    return (
      <Grid style={styles.container}>

        <br />

        <Breadcrumb>
          <Breadcrumb.Item>
            Organizations
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => this.onNavigateTo(`/organizations/show/${organization.id}`)}>
            {organization ? organization.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            Courses
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => this.onNavigateTo(`/courses/show/${course.id}`)}>
            {course ? course.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item
            onClick={() => this.onNavigateTo(`/courses/show/${course.id}/instances/show/${instance.id}`)}
          >
            {instance ? instance.period : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item
            onClick={() => this.onNavigateTo(`/courses/show/${course.id}/instances/show/${instance.id}/evaluations`)}
          >
            Evaluations
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {evaluation.title}
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          <Col xs={12} style={styles.header}>
            <h2>
              Evaluation
              {renderIf(evaluation && evaluation.title)(() => (
                <small style={{ marginLeft: 4 }}> {evaluation.title}</small>
              ))}
            </h2>
            <div>
              {renderIf(this.state.syncing)(() =>
                <span style={{ color: 'grey' }}>
                  Syncing...
                </span>
              )}
            </div>
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
              <EasyTransition
                path={this.selected}
                initialStyle={{ opacity: 0 }}
                transition="opacity 0.1s ease-in"
                finalStyle={{ opacity: 1 }}
              >
                {React.cloneElement(this.props.children, {
                  organization,
                  course,
                  instance,
                  evaluation,
                  users,
                  questions,
                  answers,
                  attendances,
                  onQuestionAdd: this.onQuestionAdd,
                  onQuestionRemove: this.onQuestionRemove,
                  onEvaluationChange: this.onEvaluationChange,
                  onQuestionsChange: this.onQuestionsChange,
                  onAttendanceAdd: this.onAttendanceAdd,
                  onAttendanceUpdate: this.onAttendanceUpdate,
                  onAttendanceRemove: this.onAttendanceRemove,
                  onAnswerChange: this.onAnswerChange,
                  onFieldsChange: this.onFieldsChange,
                  onSubmitDescription: this.onSubmitDescription,
                })}
              </EasyTransition>
            )}
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default withRouter(EvaluationCreate);

const styles = {
  container: {

  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
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
