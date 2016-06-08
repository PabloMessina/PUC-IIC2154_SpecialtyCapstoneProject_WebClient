/* eslint no-underscore-dangle:0 */

import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import {
  Form,
  Button,
  Panel,
  Col,
  Row,
} from 'react-bootstrap';
import moment from 'moment';
import Icon from 'react-fa';

import app from '../../app';
const questionService = app.service('/questions');
const evaluationsQuestionService = app.service('/evaluations-questions');

import { TrueFalse, MultiChoice, TShort, Correlation } from '../questions';
import Progress from './progress';
import CreateQuestionModal from '../create-question/modal';
import { Colors } from '../../styles';
import renderIf from 'render-if';

const MODES = {
  instructor: 'instructor',
  student: 'student',
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

export default class Questions extends Component {

  static get propTypes() {
    return {
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

      onEvaluationChange: PropTypes.func,
      onAnswerChange: PropTypes.func,
      onFieldsChange: PropTypes.func,
      onFieldsAndAnswerChange: PropTypes.func,
      onQuestionRemove: PropTypes.func,
      onQuestionAdd: PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      selected: [],
      tags: [],
      pool: [],
      hidden: [],
      interval: 1000,
    };
  }

  static diff(start, finish) {
    return moment(finish).diff(start);
  }

  constructor(props) {
    super(props);
    this.state = {
      // All tags
      tags: props.tags,
      // Selected tags
      selected: props.selected,
      // hidden questions
      hidden: props.hidden,
      // all the questions
      pool: props.pool,
      // is creating a new question
      creating: false,
      // is editing a question
      editing: false,
      // question that is being edited
      currentQuestion: undefined,
      // common error
      error: null,
    };

    this.renderQuestion = this.renderQuestion.bind(this);
    this.renderEvaluation = this.renderEvaluation.bind(this);
    this.renderQuestionPool = this.renderQuestionPool.bind(this);
    this.renderQuestionList = this.renderQuestionList.bind(this);

    this.onModalClose = this.onModalClose.bind(this);
    this.onModalSave = this.onModalSave.bind(this);
  }

  componentDidMount() {
    if (this.props.organization) this.fetchQuestions(this.props.organization.id);
    this.fetchTags();
  }

  onModalClose(/* question */) {
    this.setState({ creating: false, editing: false });
  }

  onModalSave(question) {
    if (this.state.creating) {
      const data = { ...question, id: undefined, organizationId: this.props.organization.id };

      if (!question.content) {
        // TODO: don't use alert? (can't be another modal)
        alert('Please type a content text');
        return null;
      }

      return questionService.create(data)
        .then(created => {
          this.setState({ creating: false, editing: false, error: null });
          this.props.onQuestionAdd(created);
        })
        .catch(error => this.setState({ error }));
    } else if (this.state.editing) {
      const query = {
        questionId: question.id,
        evaluationId: this.state.evaluationId,
      };
      return evaluationsQuestionService.find({ query })
      .then(result => result.data[0])
      .then(old => {
        const data = {
          customContent: question.content,
          customField: question.fields,
          customAnswer: question.answer,
        };
        return evaluationsQuestionService.patch(old.id, { ...data });
      })
      .then(() => this.setState({ creating: false, editing: false, error: null }))
      .catch(error => this.setState({ error }));
    }
    return null;
  }

  fetchTags() {
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

  fetchQuestions(organizationId) {
    const query = { organizationId };
    return questionService.find({ query })
      .then(result => result.data)
      .then(questions => this.setState({ pool: questions }));
  }

  renderQuestionList(questions) {
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

  renderQuestion(props, identifier, userMode) {
    const { onAnswerChange, onFieldsChange, onFieldsAndAnswerChange } = this.props;
    const question = props.question;
    let mode = 'reader';
    switch (userMode) {
      case 'instructor': mode = 'reader'; break;
      case 'student': mode = 'responder'; break;
      default: mode = 'reader'; break;
    }
    const element = questionFactory(question.qtype, {
      ...props,
      identifier,
      mode,
      onAnswerChange: answer => onAnswerChange(question, answer),
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

  renderQuestionPool() {
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
      </Panel>
    );
  }

  renderEvaluation(mode) {
    const {
      evaluation,
      questions,
      answers,
      onQuestionRemove,
      evaluationQuestions,
    } = this.props;
    const objects = questions.map(question => {
      const eq = evaluationQuestions.find(item => item.questionId === question.id);
      const answ = (eq && eq.customAnswer) ? eq.customAnswer : answers[question.id];
      return ({
        question: {
          ...question,
          answer: answ || (mode === 'instructor' ? question.answer : undefined),
          fields: (eq && eq.customField) ? eq.customField : question.fields,
          content: (eq && eq.customContent) ? eq.customContent : question.content,
        },
        disabled: mode === 'instructor',
      });
    });
    return (
      <Panel>
        <div style={styles.row}>
          <h3>{evaluation.title || 'No title'}</h3>
        </div>
        <p>{evaluation.description || ''}</p>

        {objects.map((object, i) => (
          <div key={i} style={styles.wrapper}>
            {this.renderQuestion(object, i + 1, mode)}
            {renderIf(mode === 'instructor')(
              <div style={styles.icons}>
                <Icon
                  size="lg"
                  name="times"
                  onClick={() => onQuestionRemove(object.question)}
                />
                <Icon
                  size="lg"
                  name="pencil"
                  style={{ marginTop: 10 }}
                  onClick={() => this.setState({ editing: true, currentQuestion: object.question })}
                />
              </div>
            )}
          </div>
        ))}
      </Panel>
    );
  }

  renderMode(mode) {
    switch (mode) {
      case 'student': return this.renderStudent();
      case 'instructor': return this.renderInstructor();
      default: return null;
    }
  }

  renderStudent() {
    const { questions } = this.props;
    const time = {
      total: questions.length,
      current: Object.keys(this.props.answers).length,
      // TODO: use real values
      start: '2016-05-20T19:19:27.588Z',
      finish: '2016-05-20T20:00:47.588Z',
    };
    return (
      <Row>
        <Col style={styles.rigth} xs={12} sm={12} md={3}>
          <Progress {...time} />
        </Col>
        <Col style={styles.left} xs={12} sm={12} md={9}>
          {this.renderEvaluation('student')}
        </Col>
      </Row>
    );
  }

  renderInstructor() {
    const { editing, creating, currentQuestion } = this.state;
    return (
      <Row>
        <CreateQuestionModal
          edit={editing}
          show={creating || editing}
          onHide={this.onModalClose}
          onSave={this.onModalSave}
          question={currentQuestion}
        />
        <Col style={styles.rigth} xs={12} sm={12} md={5}>
          <Col xs={12}>
            <Button
              style={styles.custom}
              block
              bsStyle="primary"
              onClick={() => this.setState({ creating: true, currentQuestion: undefined })}
            >
              <h5 style={{ color: 'white' }}>Add custom question</h5>
            </Button>
          </Col>
          <Col xs={12}>
            {this.renderQuestionPool()}
          </Col>
        </Col>
        <Col style={styles.left} xs={12} sm={12} md={7}>
          {this.renderEvaluation('instructor')}
        </Col>
      </Row>
    );
  }

  render() {
    const mode = ['admin', 'write'].includes(this.props.participant.permission) ? MODES.instructor : MODES.student;
    return (
      <div>
        <p>{this.state.error}</p>
        {this.renderMode(mode)}
      </div>
    );
  }
}

const styles = {
  container: {},
  left: {

  },
  rigth: {

  },
  row: {

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
    justifyContent: 'space-between',
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
};
