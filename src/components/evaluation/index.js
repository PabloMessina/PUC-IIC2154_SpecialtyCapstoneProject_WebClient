/* eslint react/prop-types:0 */

import React, { Component } from 'react';
import { Grid, Row, Col, ButtonToolbar, ButtonGroup, Button, Breadcrumb } from 'react-bootstrap';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';
import DocumentTitle from 'react-document-title';
import renderIf from 'render-if';
import moment from 'moment';

import app, { currentUser } from '../../app';
const courseService = app.service('/courses');
const participantService = app.service('/participants');
const evaluationService = app.service('/evaluations');
const questionService = app.service('/questions');
const evaluationsQuestionService = app.service('/evaluations-questions');
const answerService = app.service('/answers');
const attendanceService = app.service('/attendances');

import ErrorAlert from '../error-alert';

const SECTIONS = [{
  name: 'Information',
  description: 'Evaluation terms and date',
  path: 'description',
}, {
  name: 'Students',
  description: 'Participants and groups',
  path: 'students',
}, {
  name: 'Questions',
  description: 'List of questions',
  path: 'questions',
}, {
  name: 'Results',
  description: 'Answers and results',
  path: 'results',
}, {
  name: 'Recorrection',
  description: 'Problems reported',
  path: 'recorrection',
}];

const MODES = {
  instructor: 'instructor',
  student: 'student',
};

const Section = ({ active, disabled, children, onClick, ...props }) => (
  <ButtonGroup {...props}>
    <Button
      style={styles.tab}
      href="#"
      active={active}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  </ButtonGroup>
);

class EvaluationCreate extends Component {

  static get propTypes() {
    return {
      // Main object
      evaluation: React.PropTypes.object,

      // Defaults
      questions: React.PropTypes.array,
      attendances: React.PropTypes.array,

      // Instructor mode
      evaluationQuestions: React.PropTypes.array,
      // Student mode
      answers: React.PropTypes.object,

      // React Router
      router: React.PropTypes.object,
      params: React.PropTypes.object,
      children: React.PropTypes.any,
      location: React.PropTypes.any,

      // groups: React.PropTypes.array,
      // attendance: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      questions: [],
      evaluationQuestions: [],
      answers: {},
      attendances: [],
    };
  }

  constructor(props) {
    super(props);
    const user = currentUser();
    const evaluation = props.params.evaluation;
    const questions = evaluation.questions || props.questions;
    const attendances = evaluation.attendances || props.attendances;
    const participants = [];

    this.state = {
      // Current evaluation
      evaluation,
      participants,
      questions,
      attendances,

      // Current user
      participant: participants.find(p => p.userId === user.id),
      attendance: attendances.find(att => att.userId === user.id && att.evaluationId === evaluation.id),

      // Students mode
      answers: props.answers,
      // Instructor mode
      evaluationQuestions: evaluation.evaluationQuestions || props.evaluationQuestions,

      // Other
      organization: null,
      course: null,
      instance: evaluation.instance,
      syncing: false,
      tabStates: Array(SECTIONS.length).fill('default'),

      // attendance: props.attendance,
    };

    this.findOrCreateAnswer = this.findOrCreateAnswer.bind(this);
    this.startEvaluation = this.startEvaluation.bind(this);

    this.observe = this.observe.bind(this);
    this.observeAnswers = this.observeAnswers.bind(this);
    this.observeEvaluation = this.observeEvaluation.bind(this);
    this.observeEvaluationQuestions = this.observeEvaluationQuestions.bind(this);
    this.observeQuestions = this.observeQuestions.bind(this);

    this.onPublish = this.onPublish.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onNavigateTo = this.onNavigateTo.bind(this);
    this.onAnswerChange = this.onAnswerChange.bind(this);
    this.onFieldsChange = this.onFieldsChange.bind(this);
    this.onNavigateTo = this.onNavigateTo.bind(this);
    this.onQuestionAdd = this.onQuestionAdd.bind(this);
    this.onQuestionRemove = this.onQuestionRemove.bind(this);
  }

  componentDidMount() {
    const { evaluation } = this.state;

    this.fetchParticipants(evaluation.instance);
    this.fetchCourse(evaluation.instance.courseId);

    this.observe(evaluation);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const evaluation = nextProps.params.evaluation;
    if (evaluation && evaluation.id !== this.state.evaluation.id) {
      const questions = evaluation.questions || [];
      this.setState({ evaluation, questions, instance: evaluation.instance });
      this.observe(evaluation);
    }
  }

  componentWillUnmount() {
    if (this.evaluationObserver) this.evaluationObserver.unsubscribe();
    if (this.evalQuestionObserver) this.evalQuestionObserver.unsubscribe();
    if (this.questionObserver) this.questionObserver.unsubscribe();
    if (this.answerObserver) this.answerObserver.unsubscribe();
    if (this.attendanceObserver) this.attendanceObserver.unsubscribe();
  }

  onPublish(published = false) {
    return evaluationService.patch(this.state.evaluation.id, { published })
      .then(evaluation => {
        this.setState({ evaluation, error: null });
        return evaluation;
      })
      .catch(error => this.setState({ error }));
  }

  onDelete() {
    const { course, instance, evaluation } = this.state;
    const url = `/courses/show/${course.id}/instances/show/${instance.id}/evaluations`;
    return evaluationService.remove(evaluation.id)
      .then(() => this.props.router.push(url))
      .catch(error => this.setState({ error }));
  }

  onAnswerChange(question, answer) {
    if (question && question.id) {
      return this.findOrCreateAnswer(question, answer);
    }
    return null;
    // const indexQ = questions.findIndex((q) => q.id === id);
    // questions[indexQ].answer = answer;
    // this.setState({ answers: { ...this.state.answers, [id]: answer }, questions });
  }

  onFieldsChange() {
    throw new Error('onFieldsChange: not implemented!');
  }

  onQuestionAdd(question) {
    if (!question) return null;
    this.setState({ syncing: true });

    const questionId = question.id;
    const evaluationId = this.state.evaluation.id;
    return evaluationsQuestionService.create({ questionId, evaluationId })
      .catch(error => this.setState({ error, syncing: false }));
  }

  onQuestionRemove(question) {
    if (!question) return null;
    this.setState({ syncing: true });

    const evalq = this.state.evaluationQuestions.find(eq => eq.questionId === question.id || question);
    if (evalq && evalq.id) {
      return evaluationsQuestionService.remove(evalq.id).catch(error => this.setState({ error, syncing: false }));
    } else {
      return null;
    }
  }

  onNavigateTo(url) {
    this.props.router.push(url);
  }

  observe(evl) {
    const user = currentUser();

    this.evaluationObserver = this.observeEvaluation(evl).subscribe(evaluation => {
      // console.debug('evaluation', evaluation);
      if (evaluation) this.setState({ evaluation });
    });

    this.attendanceObserver = this.observeAttendances(evl).subscribe(attendances => {
      // console.debug('attendances', attendances);
      // const userId = currentUser().id;
      // const attendance = attendances.find(a => a.userId === userId);
      // this.setState({ attendances, attendance });
      this.setState({
        attendances,
        attendance: attendances.find(att => att.userId === user.id && att.evaluationId === evl.id),
      });

      this.evalQuestionObserver = this.observeEvaluationQuestions(evl).subscribe(evaluationQuestions => {
        // console.debug('evaluationQuestions$', evaluationQuestions);
        this.setState({ evaluationQuestions });
        const ids = evaluationQuestions.map(eq => (eq.questionId));

        const attendance = attendances
          .find(att => att.userId === user.id && att.evaluationId === evl.id);

        if (attendance) {
          this.answerObserver = this.observeAnswers(evl, attendance, ids).subscribe(objects => {
            // console.debug('answers$', objects);
            const answers = {};
            objects.forEach(({ questionId, answer }) => (answers[questionId] = answer));
            this.setState({ answers });
          });
        }

        this.questionObserver = this.observeQuestions(ids).subscribe(questions => {
          // console.debug('questions$', questions);
          this.setState({ questions });
        });
      });
    });
  }

  observeAnswers(evaluation, attendance, questions) {
    const query = {
      teamId: attendance.teamId || attendance.userId,
      evaluationId: evaluation.id || evaluation,
      questionId: { $in: questions.map(question => question.id || question) },
    };
    return answerService.find({ query }).map(result => result.data);
  }

  observeEvaluationQuestions(evl) {
    const query = {
      evaluationId: evl.id || evl,
      $sort: { id: -1 },
    };
    return evaluationsQuestionService.find({ query }).map(result => result.data);
  }

  observeQuestions(questions) {
    const query = {
      id: { $in: questions.map(q => q.id || q) },
    };
    return questionService.find({ query }).map(result => result.data);
  }

  observeEvaluation(evl) {
    return evaluationService.get(evl.id || evl);
  }

  observeAttendances(evaluation) {
    const query = {
      evaluationId: evaluation.id || evaluation,
    };
    return attendanceService.find({ query }).map(result => result.data);
  }

  findOrCreateAnswer(question, answer) {
    const { evaluation, attendance, participant } = this.state;
    const mode = ['admin', 'write'].includes(participant.permission) ? MODES.instructor : MODES.student;

    // If we are a student
    if (mode === MODES.student) {
      const query = {
        teamId: attendance.teamId,
        questionId: question.id || question,
        evaluationId: evaluation.id,
        $limit: 1,
      };

      return answerService.find({ query })
        .then(result => result.data[0])
        .then(old => {
          if (old) return answerService.patch(old.id, { ...old, answer });
          return answerService.create({
            teamId: attendance.teamId,
            questionId: question.id || question,
            evaluationId: evaluation.id,
            answer,
          });
        })
        // .then(changed => {
        //   this.setState({ answers: { ...this.state.answers, [changed.questionId]: changed.answer } });
        //   return changed;
        // })
        .catch(error => this.setState({ error }));
    }
    return null;
  }

  fetchCourse(crs) {
    const query = {
      id: crs.id || crs,
      $populate: 'organization',
    };
    return courseService.find({ query })
      .then(result => result.data[0])
      .then(course => {
        this.setState({ course, organization: course.organization, error: null });
        return course;
      })
      .catch(error => this.setState({ error }));
  }

  fetchParticipants(instance) {
    const query = {
      instanceId: instance.id || instance,
      $populate: ['user'],
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => {
        const user = currentUser();
        this.setState({
          participants,
          participant: participants.find(p => p.userId === user.id),
          error: null,
        });
        return participants;
      })
      .catch(error => this.setState({ error }));
  }

  startEvaluation(attendance) {
    if (attendance) {
      return attendanceService.patch(attendance.id, { startedAt: new Date() });
    } else {
      return Promise.reject(new Error('Attendance not found'));
    }
  }

  get selected() {
    const location = this.props.location.pathname.split('/').filter(Boolean);
    const [/* evaluations */, /* show */, /* :id */, selected] = location;
    return selected;
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
      evaluationQuestions,
      participants,
      participant,
      attendance,
    } = this.state;

    const now = moment();
    const time = moment(evaluation.finishAt) > now && moment(evaluation.startAt) < now;
    const canEdit = participant && ['admin', 'write'].includes(participant.permission);
    const selected = this.selected;

    const sections = SECTIONS.filter(section => {
      // Remove Results
      if (!canEdit && section.name === 'Results') return false;
      return true;
    }).map(section => {
      const active = selected === section.path;
      const url = `/evaluations/show/${evaluation.id}/${section.path}`;

      let disabled = false;
      if (attendance && section.name === 'Questions') {
        // In 'ms'
        const duration = evaluation.duration;
        // // When the evaluation can be started
        const startAt = moment(evaluation.startAt);
        // // When the evaluation finish
        const finishAt = moment(evaluation.finishAt);
        // // When the user started
        const startedAt = moment(attendance.startedAt);
        // // The user deadline
        const finishedAt = startedAt.isValid() ? moment.min(finishAt, startedAt.clone().add(duration, 'ms')) : finishAt;
        // // We are in the valid range
        const isOpen = now.isBetween(startAt, finishAt);
        // // We passed our or the global deadline
        const isOver = now.isAfter(finishedAt);
        // // We started the evaluation before
        const isStarted = startedAt.isValid();

        // is disabled if can't edit and has not started yet or did finish
        disabled = !(canEdit || !canEdit && !isOpen || !canEdit && isOpen && isStarted && !isOver);
      }

      return { ...section, url, active, disabled };
    });

    return (
      <Grid style={styles.container}>
        <DocumentTitle title={evaluation.title} />
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
          <Col xs={12} md={9}>
            <h2>
              Evaluation
              {renderIf(evaluation && evaluation.title)(() => (
                <small style={{ marginLeft: 4 }}> {evaluation.title}</small>
              ))}
            </h2>
            {/*
            <div>
              {renderIf(this.state.syncing)(() =>
                <span style={{ color: 'grey' }}>
                  Syncing...
                </span>
              )}
            </div>
            */}

            {/*
            {renderIf(this.state.evaluation && this.state.evaluation.description)(() => (
              <p style={{ marginLeft: 4 }}> {this.state.evaluation.description}</p>
            ))}
            */}
          </Col>
          <Col xs={12} md={3}>
            {renderIf(canEdit)(() =>
              <ButtonToolbar className="pull-right" style={{ marginTop: 30 }}>
                {renderIf(!evaluation.published)(() =>
                  <Button bsStyle="primary" onClick={() => this.onPublish(true)}>Publish</Button>
                )}
                {renderIf(evaluation.published)(() =>
                  <Button bsStyle="warning" onClick={() => this.onPublish(false)}>Un-Publish</Button>
                )}
                <Button bsStyle="danger" onClick={this.onDelete}>Delete</Button>
              </ButtonToolbar>
            )}
            {renderIf(!canEdit && attendance && !attendance.startedAt && time)(() =>
              <Button bsStyle="primary" onClick={() => this.startEvaluation(attendance)}>Start evaluation</Button>
            )}
          </Col>
        </Row>

        <ErrorAlert
          error={this.state.error}
          onDismiss={() => this.setState({ error: null })}
        />

        <Row>
          <Col style={styles.bar} xsOffset={0} xs={12}>
            <ButtonGroup justified>
              {sections.map(({ name, description, path, url, ...props }, i) =>
                <Section key={i} onClick={() => this.props.router.push(url)}>
                  <h5 style={styles.tabTitle}>{name}</h5>
                  <small style={styles.tabDescription}>{description}</small>
                </Section>
              )}
            </ButtonGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            {renderIf(course && instance && organization && participant)(() =>
              <EasyTransition
                path={this.selected}
                initialStyle={{ opacity: 0 }}
                transition="opacity 0.1s ease-in"
                finalStyle={{ opacity: 1 }}
              >
                {React.cloneElement(this.props.children, {
                  organization,
                  course,
                  // Related course instance owner of this evaluation
                  instance,
                  // Current evaluation
                  evaluation,
                  // Evaluation questions
                  questions,
                  evaluationQuestions,
                  // Current user answers
                  answers,
                  // Current user attendaces taking this evaluation
                  attendances,
                  // current user participantship
                  participant,
                  // course instance participantships
                  participants,
                  onQuestionAdd: this.onQuestionAdd,
                  onQuestionRemove: this.onQuestionRemove,
                  onAnswerChange: this.onAnswerChange,
                  onFieldsChange: this.onFieldsChange,
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
    marginTop: 25,
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
