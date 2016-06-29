/* eslint no-underscore-dangle:0 */

import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import {
  Form,
  Button,
  Panel,
  Col,
  Row,
  // FormControl,
} from 'react-bootstrap';
import moment from 'moment';
import Icon from 'react-fa';
import renderIf from 'render-if';

import app, { currentUser } from '../../app';
const questionService = app.service('/questions');
const attendanceService = app.service('/attendances');
const evaluationQuestionsService = app.service('/evaluations-questions');
const answerService = app.service('/answers');

import { TrueFalse, MultiChoice, TShort, Correlation } from '../questions';
import Progress from './progress';
import CreateQuestionModal from '../question-create/modal';
import { Colors } from '../../styles';

function questionFactory(qtype, props) {
  switch (qtype) {
    case 'trueFalse': return <TrueFalse {...props} />;
    case 'multiChoice': return <MultiChoice {...props} />;
    case 'tshort': return <TShort {...props} />;
    case 'correlation': return <Correlation {...props} />;
    default: return null;
  }
}

// TODO: add time-sync to prevent cheats

export default class Questions extends Component {

  static propTypes = {
    mode: PropTypes.string,
    pool: PropTypes.array,
    selected: PropTypes.array,
    tags: PropTypes.array,
    hidden: PropTypes.array,

    // Instructor mode
    answers: PropTypes.object,

    // Student mode
    evaluationQuestions: PropTypes.array,

    // From parent
    organization: PropTypes.object,
    course: PropTypes.object,
    participant: PropTypes.object,
    evaluation: PropTypes.object,
    questions: PropTypes.array,
    interval: PropTypes.number,
    attendances: PropTypes.array,

    onEvaluationChange: PropTypes.func,
    onAnswerChange: PropTypes.func,
    onFieldsChange: PropTypes.func,
    onFieldsAndAnswerChange: PropTypes.func,
    onQuestionRemove: PropTypes.func,
    onQuestionAdd: PropTypes.func,
  }

  static defaultProps = {
    selected: [],
    tags: [],
    pool: [],
    hidden: [],
    interval: 10000, // 10 seconds
    evaluationQuestions: [{ points: 0 }],
  }

  static diff(start, finish) {
    return moment(finish).diff(start);
  }

  state = {
    // All tags
    tags: this.props.tags,
    // Selected tags
    selected: this.props.selected,
    // hidden questions
    hidden: this.props.hidden,
    // all the questions
    pool: this.props.pool,
    // is creating a new question
    creating: false,
    // is editing a question
    editing: false,
    // question that is being edited
    currentQuestion: undefined,
    // common error
    error: null,
    // when the test is over
    isOver: false,
    // when the mouse is over the time panel
    toggle: false,
    // modify student evaluation
    viewAs: null,
    viewAsLoading: false,
    viewAsAnswers: {},

    currentPoints: this.props.evaluationQuestions.map(eq => eq.points || 0),
  }

  componentDidMount() {
    const { organization, attendances, participant, interval } = this.props;
    if (this.props.organization) this.fetchQuestions(organization.id);
    this.fetchTags();

    // Send localization to server per time interval
    if (participant.permission === 'read') {
      this.timer = setInterval(() => {
        const attendance = attendances.find(a => a.userId === currentUser().id);
        this.getLocation().then(geojson => {
          attendanceService.patch(attendance.id, { startedAt: new Date(), location: geojson });
        });
      }, interval);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { evaluationQuestions } = this.props;
    const newEQ = nextProps.evaluationQuestions;
    if (newEQ) {
      const currentPoints = newEQ.map(eq => eq.points);
      this.setState({ evaluationQuestions, currentPoints });
    }
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
  }

  onModalClose = (/* question */) => {
    this.setState({ creating: false, editing: false });
  }

  onModalSave = (question) => {
    if (this.state.creating) {
      const data = { ...question, id: undefined, organizationId: this.props.organization.id };
      return questionService.create(data)
        .then(created => {
          this.setState({ creating: false, editing: false, error: null });
          this.props.onQuestionAdd(created);
          this.setState({ modalErrors: [] });
        })
        .catch(error => {
          this.setState({ modalErrors: [error] });
        });
    } else if (this.state.editing) {
      const query = {
        questionId: question.id,
        evaluationId: this.state.evaluationId,
      };
      return evaluationQuestionsService.find({ query })
        .then(result => result.data[0])
        .then(old => {
          const data = {
            customContent: question.content,
            customField: question.fields,
            customAnswer: question.answer,
          };
          return evaluationQuestionsService.patch(old.id, { ...data });
        })
        .then(() => this.setState({ creating: false, editing: false, error: null }))
        .catch(error => this.setState({ error }));
    }
    return null;
  }

  onViewAsAnswerChange = (question, answer) => {
    const { viewAs } = this.state;
    const { evaluation } = this.props;

    let previous = this.state.viewAsAnswers[question.id];
    this.setState({ viewAsAnswers: { ...this.state.viewAsAnswers, [question.id]: answer } });

    const query = {
      teamId: viewAs,
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
            teamId: viewAs,
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
          viewAsAnswers: { ...this.state.viewAsAnswers, [question.id]: previous ? previous.answer : undefined },
        });
      });
  }

  onTimeout = () => this.setState({ isOver: true })

  getLocation = (options) => { // eslint-disable-line
    // Convert to promise
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    }).then(position => ({
      type: 'Point',
      coordinates: [
        position.coords.latitude,
        position.coords.longitude,
      ],
    }));
  }

  setPoints = (event, index) => {
    const currentPoints = this.state.currentPoints;
    currentPoints[index] = event.target.value;
    this.setState({ currentPoints });
  }

  patchPoints = (event, object) => {
    const { evaluationQuestions } = this.state;
    const questionId = object.question.id;
    const points = event.target.value;
    const index = evaluationQuestions.findIndex(item => item.questionId === questionId);
    return evaluationQuestionsService.patch(evaluationQuestions[index].id, { points })
      .then(result => {
        evaluationQuestions[index] = result;
        this.setState({ evaluationQuestions });
      })
      .catch(error => this.setState({ error }));
  }

  toggleHover = () => this.setState({ hover: !this.state.hover })

  dismissModalError = error => {
    let { modalErrors } = this.state;
    const i = modalErrors.indexOf(error);
    if (i > -1) {
      modalErrors = modalErrors.slice(0);
      modalErrors.splice(i, 1);
      this.setState({ modalErrors });
    }
  }

  fetchTags = () => {
    const query = {
      organizationId: this.props.organization.id,
    };
    return questionService.find({ query })
      .then(result => result.data)
      .then(questions => [].concat.apply([], questions.map(q => q.tags)))
      .then(tags => tags.filter(t => t && t.length))
      .then(tags => [...new Set(tags)])
      .then(tags => tags.map(t => ({ label: t, value: t })))
      .then(tags => this.setState({ tags }));
  }

  fetchQuestions = (organizationId) => {
    const query = { organizationId };
    return questionService.find({ query })
      .then(result => result.data)
      .then(questions => this.setState({ pool: questions }));
  }

  fetchAsnwersOf = (teamId) => {
    const query = {
      teamId,
      evaluationId: this.state.evaluation,
    };
    return answerService.find({ query })
      .then(result => result.data)
      .catch(error => this.setError({ error }));
  }

  renderQuestionList = (questions) => {
    const { pool, selected } = this.state;
    const objects = pool
      // Match tags
      .filter(question => selected.every(tag => question.tags.indexOf(tag.label) > -1))
      // Is not selected yet
      .filter(question => questions.findIndex(q => q.id === question.id) === -1)
      // Convert custom object
      .map(question => ({
        question,
        qtype: question.qtype,
        disabled: true,
        // TODO: add gradient
        // style: { height: 200, overflow: 'hidden' },
      }));
    return (
      <div>
        {objects.map((object, i) => (
          <div key={i} style={styles.wrapper}>
            {this.renderQuestion(object, i + 1)}
            <div style={styles.icons} onClick={() => this.props.onQuestionAdd(object.question)}>
              <Icon size="lg" name="plus" style={{ color: Colors.MAIN }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  renderQuestion = (props, identifier, userMode) => {
    const { onAnswerChange, onFieldsChange, onFieldsAndAnswerChange } = this.props;
    const question = props.question;

    let mode;
    switch (userMode) {
      case 'instructor': mode = 'reader'; break;
      case 'student': mode = 'responder'; break;
      default: mode = 'reader'; break;
    }

    const element = questionFactory(question.qtype, {
      ...props,
      identifier,
      mode,
      onAnswerChange: answer => {
        // Modify the selected student answer
        if (this.state.viewAs) this.onViewAsAnswerChange(question, answer);
        // Use normally
        else onAnswerChange(question, answer);
      },
      onFieldsChange: field => onFieldsChange(question, field),
      onFieldsAndAnswerChange: (field, answer) => onFieldsAndAnswerChange(question, field, answer),
    });
    return (
      <div key={question.id} style={styles.question}>
        <hr />
        {element}
      </div>
    );
  }

  renderQuestionPool = () => {
    const { questions } = this.props;
    const { selected, tags } = this.state;

    return (
      <Panel collapsible defaultExpanded bsStyle="primary" header={<h3>Question pool</h3>}>
        <Form style={styles.formQuestions}>
          <div style={styles.select}>
            <Select
              multi
              simpleValue={false}
              value={selected}
              options={tags}
              onChange={(value, labels) => this.setState({ selected: labels })}
              placeholder={'Tags'}
            />
          </div>
          <Button>
            <Icon name="random" style={styles.formIcon} />
          </Button>
          <Button>
            <Icon name="refresh" style={styles.formIcon} onClick={() => this.setState({ hidden: [] })} />
          </Button>
        </Form>

        <hr />

        {this.renderQuestionList(questions)}
        {renderIf(questions.length === 0)(() =>
          <p style={{ textAlign: 'center' }}>
            There is not questions to show.
            <br />
            Click on <strong>Add custom question</strong>.
          </p>
        )}
      </Panel>
    );
  }

  renderEvaluation = (mode) => {
    const {
      evaluation,
      questions,
      answers,
      onQuestionRemove,
      evaluationQuestions,
    } = this.props;

    const { viewAs, viewAsAnswers } = this.state;
    const objects = questions.map(question => {
      const eq = evaluationQuestions.find(item => item.questionId === question.id) || { points: 0 };
      let answer = undefined;
      let disabled = false;
      if (mode === 'instructor' && viewAs) {
        answer = viewAsAnswers[question.id];
      } else if (mode === 'instructor') {
        answer = (eq && eq.customAnswer) ? eq.customAnswer : question.answer;
        disabled = true;
      } else {
        answer = answers[question.id];
      }

      return ({
        points: eq.points,
        disabled,
        question: {
          ...question,
          answer,
          fields: (eq && eq.customField) ? eq.customField : question.fields,
          content: (eq && eq.customContent) ? eq.customContent : question.content,
        },
        // disabled: mode === 'instructor',
      });
    });
    const points = evaluationQuestions.reduce((previous, current) => previous + current.points, 0);

    return (
      <Panel>
        <div style={styles.row}>
          <h3>{evaluation.title || 'No title'} </h3>
          <p style={styles.points}>{points} {points > 1 ? 'points' : 'point'}</p>
        </div>
        <p>{evaluation.description || ''}</p>

        {objects.map((object, i) => (
          <div key={i} style={styles.wrapper}>
            {this.renderQuestion(object, i + 1, mode)}
            {renderIf(mode === 'instructor' && !viewAs)(
              <div style={styles.icons}>
                <input
                  style={styles.pointsInput}
                  type="number"
                  value={this.state.currentPoints[i]}
                  onChange={event => this.setPoints(event, i)}
                  onBlur={event => this.patchPoints(event, object)}
                />
                <span style={styles.pts}>pts.</span>
                <Icon
                  size="lg"
                  name="times"
                  onClick={() => onQuestionRemove(object.question)}
                />
                <Icon
                  size="lg"
                  name="pencil"
                  style={{ marginTop: 10 }}
                  onClick={() => this.setState({ editing: true, creating: false, currentQuestion: object.question })}
                />
              </div>
            )}
          </div>
        ))}
      </Panel>
    );
  }

  renderStudent = () => {
    const { evaluation, questions, attendances } = this.props;
    const attendance = attendances.find(a => a.userId === currentUser().id);
    // Right now
    const now = moment();
    const start = moment.max(attendance.startedAt, now);
    const finish = moment.min(evaluation.finishAt, moment(attendance.startedAt).add(evaluation.duration, 'ms'));
    const time = {
      total: questions.length,
      current: Object.keys(this.props.answers).length,
      onTimeout: this.onTimeout,
      start,
      finish,
    };

    // In 'ms'
    const duration = evaluation.duration;
    // // When the evaluation finish
    const finishAt = moment(evaluation.finishAt);
    // // When the user started
    const startedAt = moment(attendance.startedAt);
    // // The user deadline
    const finishedAt = startedAt.isValid() ? moment.min(finishAt, startedAt.clone().add(duration, 'ms')) : finishAt;
    // // We passed our or the global deadline
    const isOver = now.isAfter(finishedAt);
    // // We started the evaluation before
    const isStarted = startedAt.isValid();

    const validation = isStarted && !isOver;

    const timeStyle = this.state.hover ? styles.hover : styles.noHover;

    return (
      <Row>
        {validation ?
          <div>
            <Col style={styles.left} xs={12} sm={12} mdOffset={1} md={10}>
              {this.renderEvaluation('student', time)}
            </Col>
          </div>
          :
          <div>
            <Col xs={12} sm={12} mdOffset={1} md={10}>
              <h3 style={{ display: 'flex', justifyContent: 'center' }}>Evaluation is not longer available</h3>
            </Col>
          </div>
        }
        <div style={timeStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover}>
          <Panel>
            <Progress {...time} />
          </Panel>
        </div>
      </Row>
    );
  }

  renderInstructor = () => {
    const { viewAs, viewAsLoading, editing, creating, currentQuestion, modalErrors } = this.state;

    const students = this.props.attendances.filter(a => a.user).map(a => ({
      label: a.user.name,
      value: a.teamId,
    }));

    return (
      <Row>
        <CreateQuestionModal
          edit={editing}
          show={creating || editing}
          onHide={this.onModalClose}
          onSave={this.onModalSave}
          question={currentQuestion}
          externalErrors={modalErrors}
          onDismissExternalError={this.dismissModalError}
        />
        <Col style={styles.rigth} xs={12} sm={12} md={5}>
          <Col xs={12}>
            <Button
              style={styles.custom}
              block
              bsStyle="primary"
              onClick={() => this.setState({ creating: true, editing: false, currentQuestion: undefined })}
            >
              <h5 style={{ color: 'white' }}>Add custom question</h5>
            </Button>
          </Col>
          <Col xs={12}>
            {this.renderQuestionPool()}
          </Col>
        </Col>
        <Col style={styles.left} xs={12} sm={12} md={7}>
          <div style={{ padding: 10, paddingTop: 0, marginBottom: 10 }}>
            <h5>View evaluation as:</h5>
            <p>
              You can <strong>view and edit</strong> the evaluation of a student. Even after the deadline is reached.
            </p>
            <Select
              value={viewAs}
              options={students}
              loading={viewAsLoading}
              placeholder={'Student or team'}
              onChange={teamId => {
                // Set loading
                this.setState({ viewAs: teamId, viewAsLoading: true });
                if (teamId) {
                  // Fetch answer form selected user
                  return this.fetchAsnwersOf(teamId).then(answers => {
                    // Save those answers to the state
                    const viewAsAnswers = {};
                    answers.forEach(a => (viewAsAnswers[a.questionId] = a.answer));
                    this.setState({ viewAsAnswers, viewAsLoading: false });
                  });
                } else {
                  // Exit viewAs mode reseting the related state values
                  return this.setState({ viewAs: '', viewAsAnswers: {}, viewAsLoading: false });
                }
              }}
            />
          </div>
          {this.renderEvaluation('instructor')}
        </Col>
      </Row>
    );
  }

  render() {
    if (['admin', 'write'].includes(this.props.participant.permission)) {
      return this.renderInstructor();
    } else {
      return this.renderStudent();
    }
  }
}

const styles = {
  container: {},
  left: {

  },
  rigth: {

  },
  titleBar: {
    position: 'relative',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  points: {
    marginLeft: 10,
  },
  pointsInput: {
    maxWidth: 30,
    fontWeight: '100',
    fontSize: 12,
  },
  pts: {
    marginBottom: 25,
  },
  select: {
    flex: 1,
  },
  formQuestions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  question: {
    flex: 1,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  icons: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 50,
    marginRight: 10,
    marginLeft: 10,
  },
  formIcon: {
    marginLeft: 5,
    marginRight: 5,
  },
  custom: {
    marginBottom: 15,
    borderColor: Colors.MAIN,
  },
  customContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  noHover: {
    position: 'fixed',
    bottom: 30,
    right: 20,
    opacity: 0.5,
  },
  hover: {
    position: 'fixed',
    bottom: 30,
    right: 20,
  },
};
