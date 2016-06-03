import React, { Component } from 'react';
import { Grid, Row, Col, ButtonToolbar, ButtonGroup, Button, Breadcrumb } from 'react-bootstrap';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';
import renderIf from 'render-if';

import app, { currentUser } from '../../app';
const organizationService = app.service('/organizations');
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

class EvaluationCreate extends Component {

  static get propTypes() {
    return {
      // Main object
      evaluation: React.PropTypes.object,
      // Defaults
      evaluationQuestions: React.PropTypes.array,
      questions: React.PropTypes.array,
      // groups: React.PropTypes.array,
      attendances: React.PropTypes.array,
      // attendance: React.PropTypes.object,
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
      evaluationQuestions: [],
      answers: {},
      attendances: [],
      // attendance: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      // Current evaluation
      evaluation: props.params.evaluation,
      // Students rending the evaluation
      participants: [],
      evaluationQuestions: props.params.evaluation.evaluationQuestions || props.evaluationQuestions,
      questions: props.params.evaluation.questions || props.questions,
      answers: props.answers,
      attendances: props.params.evaluation.attendances || props.attendances,
      // attendance: props.attendance,
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

    this.findOrCreateAnswer = this.findOrCreateAnswer.bind(this);
    this.startEvaluation = this.startEvaluation.bind(this);

    this.observe = this.observe.bind(this);
    this.observeEvaluation = this.observeEvaluation.bind(this);
    this.observeEvaluationQuestions = this.observeEvaluationQuestions.bind(this);
    this.observeQuestions = this.observeQuestions.bind(this);
    this.observeAnswers = this.observeAnswers.bind(this);

    this.onPublish = this.onPublish.bind(this);
    this.onDelete = this.onDelete.bind(this);

    this.onNavigateTo = this.onNavigateTo.bind(this);
    // this.onGroupsChange = this.onGroupsChange.bind(this);
    // this.onAttendantsChange = this.onAttendantsChange.bind(this);
    this.onAnswerChange = this.onAnswerChange.bind(this);
    this.onFieldsChange = this.onFieldsChange.bind(this);
    this.onQuestionAdd = this.onQuestionAdd.bind(this);
    this.onQuestionRemove = this.onQuestionRemove.bind(this);
  }

  componentDidMount() {
    const { evaluation } = this.state;

    this.fetchCourse(evaluation.instance.courseId)
      .then(course => this.fetchOrganization(course.organizationId));

    this.fetchParticipants(evaluation.instanceId);

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

  onFieldsChange(id, fields) {
    if (id) {
      // console.log('onFieldsChange', id, fields);
      // const questions = this.state.questions;
      // const index = this.state.question.findIndex(q => q.id === id);
      // if (index > -1) questions[index].fields = fields;
      // this.setState({ questions });
    }
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
    this.evaluationObserver = this.observeEvaluation(evl).subscribe(evaluation => {
      // console.debug('evaluation', evaluation);
      if (evaluation) this.setState({ evaluation });
    });

    this.attendanceObserver = this.observeAttendances(evl).subscribe(attendances => {
      // console.debug('attendances', attendances);
      // const userId = currentUser().id;
      // const attendance = attendances.find(a => a.userId === userId);
      // this.setState({ attendances, attendance });
      this.setState({ attendances });

      this.evalQuestionObserver = this.observeEvaluationQuestions(evl).subscribe(evaluationQuestions => {
        // console.debug('evaluationQuestions$', evaluationQuestions);
        this.setState({ evaluationQuestions });
        const ids = evaluationQuestions.map(eq => eq.questionId);

        const userId = currentUser().id;
        const attendance = attendances
          .find(att => att.userId === userId && att.evaluationId === evl.id);

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
    const user = currentUser();
    const participant = this.state.participants.find(p => p.userId === user.id);
    const mode = ['admin', 'write'].includes(participant.permission) ? MODES.instructor : MODES.student;

    const { evaluation, attendances, evaluationQuestions } = this.state;

    // If we are a student
    if (mode === MODES.student) {
      const attendance = attendances
        .find(att => att.userId === user.id && att.evaluationId === evaluation.id);

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
    } else {
      const eq = evaluationQuestions.findIndex(item => item.questionId ===  question.id);
    }
    return null;
  }

  fetchCourse(courseId) {
    return courseService.get(courseId)
      .then(course => {
        this.setState({ course, error: null });
        return course;
      })
      .catch(error => this.setState({ error }));
  }

  fetchParticipants(instanceId) {
    const query = {
      instanceId,
      $populate: ['user'],
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => {
        this.setState({ participants, error: null });
        return participants;
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

  renderSections(participant) {
    const sections = participant && ['admin', 'write'].includes(participant.permission)
      ? SECTIONS
      : SECTIONS.filter(item => item.name !== 'Results');
    return (
      <ButtonGroup justified>
        {sections.map(this.renderSection)}
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
      participants,
    } = this.state;

    const user = currentUser();
    const participant = participants.find(p => p.userId === user.id);
    const attendance = attendances
      .find(att => att.userId === user.id && att.evaluationId === evaluation.id);


    const canEdit = participant && ['admin', 'write'].includes(participant.permission);

    return (
      <Grid style={styles.container}>
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
            {renderIf(!canEdit && attendance && !attendance.startedAt)(() =>
              <Button bsStyle="primary" onClick={() => this.startEvaluation(attendance)}>Start evaluation</Button>
            )}
          </Col>
        </Row>


        <Row>
          <Col style={styles.bar} xsOffset={0} xs={12}>
            {this.renderSections(participant)}
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
