import React, { Component, PropTypes } from 'react';
import { Panel, Col, Button } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';

import { Colors } from '../../styles';
import RichEditor from '../rich-editor';
import { TrueFalse, MultiChoice, TShort, Correlation } from '../questions';

import app, { currentUser } from '../../app';

const answerService = app.service('/answers');
const recorrectionService = app.service('/recorrections');

const MODE_QUESTION_VIEW = { studentAnswer: 'student', correct: 'correct' };
const MODES = { instructor: 'instructor', student: 'student' };
const ICON_NAME = { 1: 'check', 0: 'question', [-1]: 'times' };
const ICON_STYLE = {
  1: { color: Colors.MAIN, fontSize: 15 },
  0: { color: Colors.GRAY, fontSize: 15 },
  [-1]: { color: Colors.RED, fontSize: 15 },
};

function questionFactory(qtype, props) {
  switch (qtype) {
    case 'trueFalse': return <TrueFalse {...props} />;
    case 'multiChoice': return <MultiChoice {...props} />;
    case 'tshort': return <TShort {...props} />;
    case 'correlation': return <Correlation {...props} />;
    default: return null;
  }
}

export default class EvaluationRecorrection extends Component {

  static get propTypes() {
    return {
      evaluation: PropTypes.object,
      attendances: PropTypes.array,
      questions: PropTypes.array,
      participant: PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      evaluation: {},
      attendances: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      answers: {},
      error: null,
      questionsView: {},
      currentSolve: 0,
      currentRecorrection: null,
      messageRequest: null,
      recorrections: [],
    };
    this.fetchAll = this.fetchAll.bind(this);
    this.fetchAnswers = this.fetchAnswers.bind(this);
    this.fetchRecorrections = this.fetchRecorrections.bind(this);

    this.resolveRequest = this.resolveRequest.bind(this);
    this.setCurrentSolved = this.setCurrentSolved.bind(this);
    this.onClickResolve = this.onClickResolve.bind(this);
    this.onClickSend = this.onClickSend.bind(this);

    this.renderRowInstructor = this.renderRowInstructor.bind(this);
    this.renderQuestion = this.renderQuestion.bind(this);
    this.renderResponseForm = this.renderResponseForm.bind(this);
  }

  componentDidMount() {
    return this.fetchAll();
  }

  onClickResolve(event, recorrection) {
    let { messageRequest, currentSolve } = this.state;
    if (recorrection.response) messageRequest = recorrection.response;
    if (recorrection.solved) currentSolve = recorrection.solved;
    this.setState({
      messageRequest,
      currentSolve,
      currentRecorrection: recorrection.id,
    });
  }

  onClickSend(event, recorrectionId) {
    const userId = currentUser().id;
    const { currentSolve, messageRequest } = this.state;
    recorrectionService.patch(recorrectionId, {
      solved: currentSolve,
      response: messageRequest,
      reviewerId: userId,
    })
      .then(() => this.setState({ currentRecorrection: null, currentSolve: 0 }))
      .then(() => this.fetchRecorrections(this.props.evaluation.id));
  }

  onClickCancel() {
    this.setState({ currentRecorrection: null, messageRequest: null });
  }

  setCurrentSolved() {
    const currentSolve = this.state.currentSolve;
    if (currentSolve === -1) return this.setState({ currentSolve: 0 });
    else if (currentSolve === 0) return this.setState({ currentSolve: 1 });
    else return this.setState({ currentSolve: -1 });
  }

  changeQuestionView(mode, recorrectionId) {
    this.setState({ questionsView: { ...this.state.questionsView, [recorrectionId]: mode } });
  }

  fetchAll() {
    const evaluation = this.props.evaluation;
    return this.fetchRecorrections(evaluation.id)
      .then(recorrections => {
        recorrections.forEach(recorrection => {
          const { responsableId, questionId, id } = recorrection;
          return this.fetchAnswers(id, responsableId, questionId);
        });
      })
      .catch(error => this.setState({ error }));
  }

  fetchAnswers(recorrectionId, responsableId, questionId) {
    const attendances = this.props.attendances;
    const index = attendances.findIndex(item => item.userId === responsableId);
    if (index < 0) return new Error('team_id not found');
    const query = {
      teamId: attendances[index].teamId,
      questionId,
      $limit: 1,
    };
    return answerService.find({ query })
      .then(result => result.data[0])
      .then(answerObject => {
        const answers = { ...this.state.answers };
        return this.setState({
          answers: { ...answers, [recorrectionId]: answerObject.answer },
        });
      })
      .catch(error => this.setState({ error }));
  }

  fetchRecorrections(evaluationId) {
    if (!evaluationId) return new Error('evaluation-id undefined');
    const query = {
      evaluationId,
    };
    return recorrectionService.find({ query })
    .then(result => result.data)
    .then(recorrections => {
      const questionsView = { ...this.state.questionsView };
      recorrections.forEach(recorrection => {
        questionsView[recorrection.id] = MODE_QUESTION_VIEW.studentAnswer;
      });
      this.setState({ recorrections, questionsView });
      return recorrections;
    })
    .catch(error => this.setState({ error }));
  }

  resolveRequest(solve) {
    if (this.state.currentSolve === solve) return this.setState({ currentSolve: 0 });
    return this.setState({ currentSolve: solve });
  }

  renderResponseForm(recorrectionId) {
    const solved = this.state.currentSolve;
    return (
      <div>
        <hr />
        <div style={styles.column}>
          <div style={{ ...styles.row, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <span>
              <h5 style={{ display: 'inline' }}>Response. </h5>
              Enter a message:
            </span>
          </div>
          <div style={styles.editorContainer}>
            <RichEditor
              style={styles.richEditor}
              content={this.state.messageRequest}
              onChange={messageRequest => this.setState({ messageRequest })}
            />
          </div>
          <div style={{ ...styles.row, ...{ display: 'flex', alignSelf: 'flex-end' } }}>
            <Button
              style={{ marginTop: 10 }}
              onClick={this.setCurrentSolved}
            >
              <Icon style={{ ...ICON_STYLE[solved] }} name={ICON_NAME[solved]} />
              {solved !== 0 ? ' Solved' : ' Unsolved'}
            </Button>
            <Button
              style={{ marginTop: 10, marginLeft: 10 }}
              onClick={e => this.onClickSend(e, recorrectionId)}
            >
              Submit
            </Button>
            <Button
              style={{ marginTop: 10, marginLeft: 10 }}
              onClick={() => this.setState({ currentRecorrection: null })}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  renderQuestion(mode, modeQuestionView, recorrectionId, questionId, identifier) {
    const { questions } = this.props;
    const { answers } = this.state;

    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex < 0) return null;
    const question = questions[questionIndex];
    let answer = question.answer;

    if ((mode === MODES.instructor && modeQuestionView === MODE_QUESTION_VIEW.studentAnswer)
    || mode === MODES.student) {
      answer = answers[recorrectionId];
    }

    return questionFactory(question.qtype, {
      identifier,
      question: {
        ...question,
        answer,
      },
      disabled: true,
      mode: 'reader',
    });
  }

  renderRowInstructor(recorrection, attendance, key) {
    const { id, message, questionId } = recorrection;
    const student = attendance && attendance.user ? attendance.user.name : '';
    const mode = this.state.questionsView[id];

    const question = this.renderQuestion(MODES.instructor, mode, id, questionId, key);
    const questionViewStudent = this.state.questionsView[recorrection.id] === MODE_QUESTION_VIEW.studentAnswer;

    let response = false;
    if (recorrection.response || recorrection.solved !== 0) {
      const reviewer = currentUser().name;
      response = {
        message: recorrection.response,
        solved: recorrection.solved,
        reviewer: reviewer || 'unknown',
      };
    }

    return (
      <Panel key={key}>

        {/* Left part of row: question*/}
        <Col xs={12} md={6}>
          <div style={styles.questionTop}>
            <Button
              style={questionViewStudent ? styles.selectedButton : styles.buttonsInRow}
              onClick={() => this.changeQuestionView(MODE_QUESTION_VIEW.studentAnswer, recorrection.id)}
            >
              Student answer
            </Button>
            <Button
              style={!questionViewStudent ? styles.selectedButton : styles.buttonsInRow}
              onClick={() => this.changeQuestionView(MODE_QUESTION_VIEW.correct, recorrection.id)}
            >
              Correct answer
            </Button>
          </div>

          {question}

        </Col>

        {/* Right part of row: message request, form to solve request */}
        <Col xs={12} md={6}>
          <br />
          <span>

            {/* Student request*/}
            <h5 style={{ display: 'inline' }}>Recorrection request </h5>
            by {student}
            <RichEditor
              style={styles.richEditorReadOnly}
              content={message}
              readOnly
            />

            {/* Response*/}
            {renderIf(this.state.currentRecorrection === recorrection.id)(
              this.renderResponseForm(recorrection.id)
            )}
            {renderIf(this.state.currentRecorrection !== recorrection.id && response)(
              <div>
                <hr />
                <div style={styles.column}>
                  <div style={{ ...styles.row, justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <span>
                      <h5 style={{ display: 'inline' }}>Response </h5>
                      by {currentUser().name}
                    </span>
                    <span>
                      <Icon style={{ ...ICON_STYLE[response.solved] }} name={ICON_NAME[response.solved]} />
                      {response && response.solved !== 0 ? ' Solved' : ' Unsolved'}
                    </span>
                  </div>

                  <RichEditor
                    style={styles.richEditorReadOnly}
                    content={response.message || ''}
                    readOnly
                  />
                  {renderIf(this.state.currentRecorrection !== recorrection.id)(
                    <Button
                      style={{ display: 'flex', alignSelf: 'flex-end', marginTop: 10, marginBottom: 10 }}
                      onClick={e => this.onClickResolve(e, recorrection)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            )}
            {renderIf(!response && this.state.currentRecorrection !== recorrection.id)(
              <Button
                style={{ display: 'flex', alignSelf: 'flex-end', marginTop: 10, marginBottom: 10 }}
                onClick={e => this.onClickResolve(e, recorrection)}
              >
                Solve
              </Button>
            )}
          </span>
        </Col>
      </Panel>
    );
  }

  render() {
    const { recorrections } = this.state;
    const { attendances } = this.props;
    return (
      <div style={styles.container}>
        {renderIf(!recorrections.length)(<h3>There aren't recorrection in this evaluation.</h3>)}
        {recorrections.map((recorrection, index) => {
          const attendance = attendances
            .find(item => item.userId === recorrection.responsableId);
          return this.renderRowInstructor(recorrection, attendance, index);
        })}
      </div>
    );
  }
}

const styles = {
  container: {},
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  richEditor: {
    padding: 10,
    fontSize: 15,
    overflow: 'auto',
  },
  richEditorReadOnly: {
    padding: 0,
    fontSize: 15,
    overflow: 'auto',
  },
  editorContainer: {
    border: 1,
    borderColor: '#eeeeee',
    borderStyle: 'solid',
  },
  recorrectionStudent: {
    margin: 0,
    marginRight: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestTop: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recorrectionDate: {
    margin: 0,
    marginRight: 10,
  },
  icon: {
    color: Colors.MAIN,
    fontSize: 40,
    marginLeft: 3,
    marginRight: 3,
  },
  iconRed: {
    color: Colors.RED,
    fontSize: 40,
    marginLeft: 3,
    marginRight: 3,
  },
  iconDisable: {
    color: Colors.DISABLE,
    fontSize: 40,
    marginLeft: 3,
    marginRight: 3,
  },
  requestOptions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  iconsRow: {
    marginTop: 0,
  },
  buttonsInRow: {
    margin: 3,
  },
  selectedButton: {
    margin: 3,
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
  },
  buttonsRow: {
    marginBottom: 10,
  },
  questionTop: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  requestResume: {
  },
  requestResumeLabel: {
    margin: 0,
    fontSize: 15,
  },
};
