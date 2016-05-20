/* eslint no-underscore-dangle:0 */

import React, { Component } from 'react';
import Select from 'react-select';
import {
  Form,
  Button,
  Panel,
  Col,
  Row,
} from 'react-bootstrap';
import Icon from 'react-fa';

import app from '../../app';
const questionService = app.service('/questions');

import { TrueFalse, MultiChoice, TShort } from '../questions';
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
    default: return null;
  }
}

export default class Questions extends Component {

  static get propTypes() {
    return {
      mode: React.PropTypes.string,
      pool: React.PropTypes.array,
      selected: React.PropTypes.array,
      tags: React.PropTypes.array,
      hidden: React.PropTypes.array,

      // From parent
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      participant: React.PropTypes.object,
      evaluation: React.PropTypes.object,
      answers: React.PropTypes.object,
      questions: React.PropTypes.array,

      onEvaluationChange: React.PropTypes.func,
      onQuestionsChange: React.PropTypes.func,
      onAnswerChange: React.PropTypes.func,
      onFieldsChange: React.PropTypes.func,
      onQuestionRemove: React.PropTypes.func,
      onQuestionAdd: React.PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      selected: [],
      tags: [
        { label: 'Tag 1', value: 'Tag 1' },
        { label: 'Tag 2', value: 'Tag 2' },
        { label: 'Tag 3', value: 'Tag 3' },
        { label: 'Tag 4', value: 'Tag 4' },
        { label: 'Tag 5', value: 'Tag 5' },
      ],
      pool: [],
      hidden: [],
    };
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
  }

  onModalClose(/* question */) {
    this.setState({ creating: false });
  }

  onModalSave(question) {
    const data = { ...question, id: undefined, organizationId: this.props.organization.id };

    return questionService.create(data)
      .then(created => {
        this.setState({ creating: false, error: null });
        this.props.onQuestionAdd(created);
      })
      .catch(error => this.setState({ error }));
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
        answer: question.answer,
        fields: question.fields,
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

  renderQuestion(props, identifier, mode) {
    const { onAnswerChange, onFieldsChange } = this.props;
    const question = props.question;
    let questionMode = 'reader';
    switch (mode) {
      case 'instructor': questionMode = 'editor'; break;
      case 'student': questionMode = 'responder'; break;
      default: questionMode = 'responder'; break;
    }
    const element = questionFactory(question.qtype, {
      ...props,
      identifier,
      mode: questionMode,
      onAnswerChange: answer => onAnswerChange(question.id, answer),
      onFieldsChange: field => onFieldsChange(question.id, field),
    });
    return (
      <div key={question.id} style={styles.question}>
        {element}
        <hr />
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
    const { evaluation, questions, answers, onQuestionRemove } = this.props;
    const objects = questions.map(question => ({
      question,
      answer: answers[question.id] || question.answer,
      fields: question.fields,
      disabled: false,
    }));
    return (
      <Panel>
        <h3>{evaluation.title || 'No title'}</h3>
        <p>{evaluation.description || ''}</p>
        <hr />
        {objects.map((question, i) => (
          <div key={i} style={styles.wrapper}>
            {this.renderQuestion(question, i + 1)}
            {renderIf(mode === 'instructor')(
              <div style={styles.icons} onClick={() => onQuestionRemove(question.question)}>
                <Icon size="lg" name="minus" style={{ color: Colors.RED }} />
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
    return (
      <Row>
        <Col style={styles.rigth} xs={12} sm={12} md={3}>
          <Panel>
            <p>Progress</p>
          </Panel>
        </Col>
        <Col style={styles.left} xs={12} sm={12} md={9}>
          {this.renderEvaluation('student')}
        </Col>
      </Row>
    );
  }
  renderInstructor() {
    return (
      <Row>
        <CreateQuestionModal show={this.state.creating} onHide={this.onModalClose} onSave={this.onModalSave} />
        <Col style={styles.rigth} xs={12} sm={12} md={5}>
          <Col xs={12}>
            <Button style={styles.custom} block bsStyle="default" onClick={() => this.setState({ creating: true })}>
              <h5>Add custom question</h5>
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
    color: Colors.MAIN,
  },
  customContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
};
