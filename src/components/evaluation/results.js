/* eslint no-param-reassign:0 */

import React, { PropTypes, Component } from 'react';
import { Panel, Col, Button } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';

import app, { currentUser } from '../../app';
const answerService = app.service('/answers');
const recorrectionService = app.service('/recorrections');

import RichEditor from '../rich-editor';
import { Colors } from '../../styles';
import correction from '../../utils/correction';
import { TrueFalse, MultiChoice, TShort, Correlation } from '../questions';
import {
  TrueFalse as TrueFalseResult,
  MultiChoice as MultiChoiceResult,
  TShort as TShortResult,
  Correlation as CorrelationResult,
} from './qresults';

const MODES = {
  instructor: 'instructor',
  student: 'student',
};

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

function dataFactory(question, answers) {
  const props = {
    question,
    answers,
  };
  switch (question.qtype) {
    case 'trueFalse': return <TrueFalseResult {...props} />;
    case 'multiChoice': return <MultiChoiceResult {...props} />;
    case 'tshort': return <TShortResult {...props} />;
    case 'correlation': return <CorrelationResult {...props} />;
    default: return null;
  }
}

export default class EvaluationResults extends Component {

  static get propTypes() {
    return {
      mode: PropTypes.string,
      pool: PropTypes.array,
      selected: PropTypes.array,
      tags: PropTypes.array,
      hidden: PropTypes.array,

      // From parent
      organization: PropTypes.object,
      course: PropTypes.object,
      participant: PropTypes.object,
      participants: PropTypes.array,
      evaluation: PropTypes.object,
      answers: PropTypes.object,
      attendances: PropTypes.array,
      questions: PropTypes.array,
      interval: PropTypes.number,
      evaluationQuestions: React.PropTypes.array,

      onEvaluationChange: PropTypes.func,
      onAnswerChange: PropTypes.func,
      onFieldsChange: PropTypes.func,
      onFieldsAndAnswerChange: PropTypes.func,
      onQuestionRemove: PropTypes.func,
      onQuestionAdd: PropTypes.func,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      answers: [],
      recorrection: null,
      recorrections: [],
      messageRequest: null,
      error: null,
    };

    this.observeAnswers = this.observeAnswers.bind(this);
    this.observeRecorrections = this.observeRecorrections.bind(this);

    this.generateData = this.generateData.bind(this);

    this.renderMode = this.renderMode.bind(this);

    // Users permission
    this.renderStudent = this.renderStudent.bind(this);
    this.renderInstructor = this.renderInstructor.bind(this);

    // Instructor
    this.renderInstructorRow = this.renderInstructorRow.bind(this);

    // Students
    this.renderStudentRow = this.renderStudentRow.bind(this);
    this.renderRecorrectionForm = this.renderRecorrectionForm.bind(this);
    this.renderWithRecorrection = this.renderWithRecorrection.bind(this);
    this.renderWithoutRecorrection = this.renderWithoutRecorrection.bind(this);

    this.onChangeMessage = this.onChangeMessage.bind(this);

    this.setRecorrection = this.setRecorrection.bind(this);
    this.sendCorrectionRequest = this.sendCorrectionRequest.bind(this);
  }

  componentDidMount() {
    this.answerObserver = this.observeAnswers(this.props.evaluation)
      .subscribe(answers => this.setState({ answers }));
    this.recorrectionObserver = this.observeRecorrections(this.props.evaluation)
      .subscribe(recorrections => this.setState({ recorrections }));
  }

  componentWillUnmount() {
    if (this.answerObserver) this.answerObserver.unsubscribe();
    if (this.recorrectionObserver) this.recorrectionObserver.unsubscribe();
  }

  onChangeMessage() {}

  setRecorrection(questionId, recorrection) {
    if (!recorrection) this.setState({ recorrection: questionId });
    this.setState({
      recorrection: questionId,
      messageRequest: recorrection.message,
    });
  }

  observeAnswers(evaluation) {
    const query = {
      evaluationId: evaluation.id || evaluation,
    };
    return answerService.find({ query }).map(result => result.data);
  }

  observeRecorrections() {
    const responsableId = currentUser().id;
    const query = {
      responsableId,
    };
    return recorrectionService.find({ query }).map(result => result.data);
  }

  /**
   * [Create a request for recorrection]
   * @param  {object} event      [from button]
   * @param  {string} questionId [question to recorrection]
   */
  sendCorrectionRequest(event, questionId, recorrectionId) {
    event.preventDefault();

    const { messageRequest } = this.state;
    const { evaluation, attendances } = this.props;
    const userId = currentUser().id;
    const attendance = attendances.find(item => item.userId === userId);
    const query = {
      questionId,
      teamId: attendance.teamId,
      evaluationId: evaluation.id,
      message: messageRequest,
      responsableId: userId,
    };
    if (recorrectionId) {
      return recorrectionService.patch(recorrectionId, { message: messageRequest })
      .then(() => this.setState({ recorrection: null, messageRequest: null }))
      .catch(error => this.setState({ error }));
    }
    return recorrectionService.create(query)
      .then(() => this.setState({ recorrection: null, messageRequest: null }))
      .catch(error => this.setState({ error }));
  }

  generateData(question, userId, index) {
    const { answers } = this.state;
    const { attendances, evaluationQuestions } = this.props;

    // User's attendance object
    const attendance = attendances.find(item => item.userId === userId);

    // Search the user's answer to the current question
    const answerObj = answers.find(answ => answ.teamId === attendance.teamId && question.id === answ.questionId);
    const answer = answerObj ? answerObj.answer : answerObj;

    // correct answer
    const correct = question.answer;

    // expected score
    const evaluationQuestion = evaluationQuestions.find(eq => eq.questionId === question.id);
    const totalScore = evaluationQuestion ? evaluationQuestion.points : null;

    // Default options to tshort correction.
    // TODO: Allow user change the correction options
    const options = question.qtype === 'tshort'
    ? {
      threshold: 0.8,
      lower: true,
      special: true,
    }
    : {};

    // Correct user's answer
    const score = answer
      ? correction(question.qtype, correct, answer, options)
      : {};

    // Create the component corresponding to current data
    const questionComponent = questionFactory(question.qtype, {
      // Render the user's answer
      question: {
        ...question,
        answer,
      },
      identifier: index,
      disabled: true,
      mode: 'reader',
    });
    return ({ questionId: question.id, questionComponent, score, totalScore });
  }

  renderInstructorRow(question, index) {
    const element = questionFactory(question.qtype, {
      question,
      identifier: index + 1,
      answer: question.answer,
      fields: question.fields,
      disabled: true,
      mode: 'reader',
    });
    const graph = dataFactory(question, this.state.answers.filter(a => a.questionId === question.id));

    return (
      <Panel key={index}>
        <Col xs={12} md={6}>
          {element}
        </Col>
        <Col xs={12} md={6}>
          {graph}
        </Col>
      </Panel>
    );
  }

  renderInstructor(questions) {
    return (
      <div>
        {questions.map((question, index) => this.renderInstructorRow(question, index))}
      </div>
    );
  }

  renderRecorrectionForm(questionId, recorrectionId) {
    return (
      <div>
        <hr />
        <div style={styles.column}>
          <span style={{ marginBottom: 10 }}>
            <h5 style={{ display: 'inline' }}>Recorrection request. </h5>
            Enter a message:
          </span>
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
              onClick={e => this.sendCorrectionRequest(e, questionId, recorrectionId)}
            >
              Submit
            </Button>
            <Button
              style={{ marginTop: 10, marginLeft: 10 }}
              onClick={() => this.setState({ recorrection: null })}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  renderWithoutRecorrection(questionId) {
    if (this.state.recorrection !== questionId) {
      return (
        <div>
          <div style={styles.column}>
            <Button
              style={{ display: 'flex', alignSelf: 'flex-end', marginTop: 10, marginBottom: 10 }}
              onClick={() => this.setRecorrection(questionId)}
            >
              Request recorrection
            </Button>
          </div>
        </div>
      );
    }
    return this.renderRecorrectionForm(questionId);
  }

  renderWithRecorrection(recorrection) {
    if (this.state.recorrection !== recorrection.questionId) {
      return (
        <div>
          <hr />
          <div style={styles.column}>
            <div style={{ ...styles.row, justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span>
                <h5 style={{ display: 'inline' }}>Recorrection request </h5>
                by {currentUser().name}
              </span>
              <span>
                <Icon style={{ ...ICON_STYLE[recorrection.solved] }} name={ICON_NAME[recorrection.solved]} />
                {recorrection && recorrection.solved !== 0 ? ' Solved' : ' Unsolved'}
              </span>
            </div>
            <RichEditor
              style={styles.richEditorReadOnly}
              content={recorrection.message}
              readOnly
            />
            {renderIf(recorrection.solved === 0)(
              <Button
                style={{ display: 'flex', alignSelf: 'flex-end', marginTop: 10, marginBottom: 10 }}
                onClick={() => this.setRecorrection(recorrection.questionId, recorrection)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      );
    }
    return this.renderRecorrectionForm(recorrection.questionId, recorrection.id);
  }

  renderStudentRow(object, index) {
    const { questionId, questionComponent } = object;
    const { participants } = this.props;
    // find existent recorrection request to current question
    const { recorrections } = this.state;
    const recorrection = recorrections.find(r => r.questionId === questionId);

    let response = false;
    if (recorrection && (recorrection.response || recorrection.solved !== 0)) {
      const reviewer = participants.find(participant => participant.userId === recorrection.reviewerId);
      response = {
        message: recorrection.response,
        solved: recorrection.solved,
        reviewer: reviewer ? reviewer.user.name : 'unknown',
      };
    }
    const right = recorrection
    ? this.renderWithRecorrection(recorrection)
    : this.renderWithoutRecorrection(questionId);

    return (
      <Panel key={index}>
         <Col xs={12} md={6}>
           {questionComponent}
         </Col>
           <Col xs={12} md={6} style={styles.column}>
              <span>
                <h5 style={{ display: 'inline', marginRight: 10 }}>Result </h5>
                  score: {object.score.correct}/{object.totalScore}
              </span>
              <div style={styles.column}>
                {right}
                {renderIf(response)(
                  <div>
                    <hr />
                    <span>
                      <h5 style={{ display: 'inline' }}>Response </h5>
                      by {response.reviewer}
                      </span>
                    <RichEditor
                      style={styles.richEditorReadOnly}
                      content={response.message}
                      readOnly
                    />
                    <br />
                  </div>
                )}
              </div>
           </Col>
      </Panel>
    );
  }

  renderStudent(questions) {
    const userId = currentUser().id;

    // Collecting the necessary data
    const objects = questions.map((question, index) => this.generateData(question, userId, index))
    .filter(item => item.score.correct === 0); // Show incorrect answers only

    return (
      <div style={styles.container}>
        <h3>Preguntas incorrectas:</h3>
        <br />
        {objects.map((obj, index) => this.renderStudentRow(obj, index))}
      </div>
    );
  }

  renderMode(mode, questions) {
    switch (mode) {
      case MODES.student: return this.renderStudent(questions);
      case MODES.instructor: return this.renderInstructor(questions);
      default: return null;
    }
  }

  render() {
    const mode = ['admin', 'write'].includes(this.props.participant.permission) ? MODES.instructor : MODES.student;
    // Show questions with answer only
    const questions = this.props.questions.filter(q => {
      if (!q.answer) console.log('Question has no answer:', q); // eslint-disable-line
      return q.answer;
    });

    return this.renderMode(mode, questions);
  }
}

const styles = {
  container: {
    display: 'block',
  },
  question: {
    width: 500,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  columnLeft: {
    marginRight: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  columnRight: {
    marginLeft: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  icon: {
    color: Colors.MAIN,
    fontSize: 50,
    fontWeight: '100',
  },
  correctionRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctionElement: {
    margin: 30,
    marginTop: 50,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
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
};
