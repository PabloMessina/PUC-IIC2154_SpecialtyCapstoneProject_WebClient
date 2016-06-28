/* eslint react/prop-types:0 no-alert:0 */

import React, { PropTypes, Component } from 'react';
import {
  Grid,
  Row,
  Col,
  ButtonToolbar,
  Button,
  Breadcrumb,
} from 'react-bootstrap';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';
import DocumentTitle from 'react-document-title';
import renderIf from 'render-if';
import ErrorAlert from '../error-alert';
import moment from 'moment';

import HorizontalNavigationBar from './navigation-bar/';
import { withTimeSyncronizer } from '../time-syncronizer';

import app, { currentUser } from '../../app';
const courseService = app.service('/courses');
const participantService = app.service('/participants');
const evaluationService = app.service('/evaluations');
const questionService = app.service('/questions');
const evaluationsQuestionService = app.service('/evaluations-questions');
const answerService = app.service('/answers');
const attendanceService = app.service('/attendances');

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

const StartButton = withTimeSyncronizer({ ticks: 5 })(({ finishAt, startAt, onClick, getTime }) => {
  const now = getTime();
  const disabled = !now.isBetween(moment(startAt), moment(finishAt));
  return <Button bsStyle="primary" disabled={disabled} onClick={onClick}>Start evaluation</Button>;
});

class Evaluation extends Component {

  static propTypes = {
    // Main object
    evaluation: PropTypes.object,

    // Defaults
    questions: PropTypes.array,
    attendances: PropTypes.array,

    // Instructor mode
    evaluationQuestions: PropTypes.array,
    // Student mode
    answers: PropTypes.object,

    // React Router
    router: PropTypes.object,
    params: PropTypes.object,
    children: PropTypes.any,
    location: PropTypes.any,

    // Time syncronizer
    // getTime: PropTypes.func,
  }

  static defaultProps = {
    questions: [],
    evaluationQuestions: [],
    answers: {},
    attendances: [],
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
      location: {},
    };
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

  onPublishConfirm = () => {
    const { attendances } = this.state;
    if (attendances.length !== 0 || confirm(  // eslint-disable-line
      `This evaluation has no students assigned!

      Do you really want to publish it?`)) {
      this.onPublish(true);
    }
  }

  onPublish = (published = false) => {
    const id = this.state.evaluation.id;
    return evaluationService.patch(id, { published })
      .then(evaluation => {
        this.setState({ evaluation, error: null });
        return evaluation;
      })
      .catch(error => this.setState({ error }));
  }

  onDelete = () => {
    if (window.confirm('Do you really want to delete this test?')) { // eslint-disable-line
      const { course, instance, evaluation } = this.state;
      const url = `/courses/show/${course.id}/instances/show/${instance.id}/evaluations`;
      return evaluationService.remove(evaluation.id)
        .then(() => this.props.router.push(url))
        .catch(error => this.setState({ error }));
    }
    return true;
  }

  onAnswerChange = (question, answer) => {
    const { questions } = this.state;
    const indexQ = questions.findIndex((q) => q.id === question.id);
    questions[indexQ].answer = answer;
    this.setState({ answers: { ...this.state.answers, [question.id]: answer }, questions });
    if (question && question.id) {
      return this.findOrCreateAnswer(question, answer);
    }
    return null;
  }

  onFieldsChange = () => {
    throw new Error('onFieldsChange: not implemented!');
  }

  onQuestionAdd = (question) => {
    if (!question) return null;
    this.setState({ syncing: true });

    const questionId = question.id;
    const evaluationId = this.state.evaluation.id;
    return evaluationsQuestionService.create({ questionId, evaluationId })
      .catch(error => this.setState({ error, syncing: false }));
  }

  onQuestionRemove = (question) => {
    if (!question) return null;
    this.setState({ syncing: true });

    const evalq = this.state.evaluationQuestions.find(eq => eq.questionId === (question.id || question));
    if (evalq && evalq.id) {
      return evaluationsQuestionService.remove(evalq.id).catch(error => this.setState({ error, syncing: false }));
    } else {
      return null;
    }
  }

  onNavigateTo = (url) => this.props.router.push(url)

  getLocation = (options) => new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  }).then(position => ({
    type: 'Point',
    coordinates: [
      position.coords.latitude,
      position.coords.longitude,
    ],
  }))

  observe = (evl) => {
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
    });

    this.evalQuestionObserver = this.observeEvaluationQuestions(evl).subscribe(evaluationQuestions => {
      // console.debug('evaluationQuestions$', evaluationQuestions);
      this.setState({ evaluationQuestions });
      const ids = evaluationQuestions.map(eq => (eq.questionId));

      const attendance = this.state.attendances
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
  }

  observeAnswers = (evaluation, attendance, questions) => {
    const query = {
      teamId: attendance.teamId || attendance.userId,
      evaluationId: evaluation.id || evaluation,
      questionId: { $in: questions.map(question => question.id || question) },
    };
    return answerService.find({ query }).map(result => result.data);
  }

  observeEvaluationQuestions = (evl) => {
    const query = {
      evaluationId: evl.id || evl,
      $sort: { createdAt: -1 },
    };
    return evaluationsQuestionService.find({ query }).map(result => result.data);
  }

  observeQuestions = (questions) => {
    const query = {
      id: { $in: questions.map(q => q.id || q) },
      $sort: { createdAt: -1 },
    };
    return questionService.find({ query }).map(result => result.data);
  }

  observeEvaluation = (evl) => evaluationService.get(evl.id || evl)

  observeAttendances = (evaluation) => {
    const query = {
      evaluationId: evaluation.id || evaluation,
    };
    return attendanceService.find({ query }).map(result => result.data);
  }

  findOrCreateAnswer = (question, answer) => {
    const { evaluation, attendance, participant } = this.state;
    const mode = ['admin', 'write'].includes(participant.permission) ? MODES.instructor : MODES.student;

    // Set it locally
    let previous = this.state.answers[question.id];
    this.setState({ answers: { ...this.state.answers, [question.id]: answer } });

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
          previous = old;
          return (old)
            ? answerService.patch(old.id, { ...old, answer })
            : answerService.create({
              teamId: attendance.teamId,
              questionId: question.id || question,
              evaluationId: evaluation.id,
              answer,
            });
        })
        .then(() => this.setState({ error: null }))
        .catch(error => {
          // Restore previous answer value
          this.setState({
            error,
            answers: { ...this.state.answers, [question.id]: previous ? previous.answer : undefined },
          });
        });
    }
    return null;
  }

  fetchCourse = (crs) => {
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

  fetchParticipants = (instance) => {
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

  startEvaluation = async (attendance) => {
    if (attendance) {
      // Any date is ignored, because the server takes it's own time
      const patched = await attendanceService.patch(attendance.id, { startedAt: new Date() });
      const url = `/evaluations/show/${attendance.evaluationId}/questions`;
      this.props.router.push(url);
      return patched;
    } else {
      return new Error('Attendance not found');
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
      error,
    } = this.state;

    const canEdit = participant && ['admin', 'write'].includes(participant.permission);
    const selected = this.selected;

    return (
      <Grid style={styles.container}>
        <DocumentTitle title={evaluation.title} />
        <Breadcrumb>
          <Breadcrumb.Item active>
            Organizations
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => this.onNavigateTo(`/organizations/show/${organization.id}`)}>
            {organization ? organization.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => this.onNavigateTo(`/organizations/show/${organization.id}/courses`)}>
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
                  <Button bsStyle="primary" onClick={this.onPublishConfirm}>Publish</Button>
                )}
                {renderIf(evaluation.published)(() =>
                  <Button bsStyle="warning" onClick={() => this.onPublish(false)}>Un-Publish</Button>
                )}
                <Button bsStyle="danger" onClick={this.onDelete}>Delete</Button>
              </ButtonToolbar>
            )}
            {renderIf(!canEdit && attendance && !attendance.startedAt)(() =>
              <StartButton
                finishAt={evaluation.finishAt}
                startAt={evaluation.startAt}
                onClick={() => this.startEvaluation(attendance)}
              />
            )}
          </Col>
        </Row>

        <ErrorAlert
          error={error}
          onDismiss={() => this.setState({ error: null })}
        />
        <Row>
          <Col style={styles.bar} xsOffset={0} xs={12}>
            <HorizontalNavigationBar
              sections={SECTIONS}
              selected={selected}
              evaluation={evaluation}
              attendance={attendance}
              canEdit={canEdit}
              onClick={section => this.props.router.push(`/evaluations/show/${evaluation.id}/${section.path}`)}
            />
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

export default withRouter(Evaluation);

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
