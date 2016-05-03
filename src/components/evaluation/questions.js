/* eslint no-underscore-dangle:0 */

import React, { Component } from 'react';

import Select from 'react-select';
import {
  DropdownButton,
  MenuItem,
  Form,
  Panel,
  Col,
  Row,
} from 'react-bootstrap';
import { TrueFalse, MultiChoice, TShort } from '../questions';
import Icon from 'react-fa';

import renderIf from 'render-if';

import { Colors } from '../../styles';

const questionTypes = {
  multiChoice: 'Multi choice',
  tshort: 'Short text',
  trueFalse: 'True - False',
};
const defaultTags = [
  { label: 'Tag 1', value: 'Tag 1' },
  { label: 'Tag 2', value: 'Tag 2' },
  { label: 'Tag 3', value: 'Tag 3' },
  { label: 'Tag 4', value: 'Tag 4' },
  { label: 'Tag 5', value: 'Tag 5' },
];

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
      allQuestions: React.PropTypes.array,
      tags: React.PropTypes.array,
      allTags: React.PropTypes.array,
      hideQuestions: React.PropTypes.array,
      bufferQuestion: React.PropTypes.any,

      // From parent
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      evaluation: React.PropTypes.object,
      answers: React.PropTypes.object,
      questions: React.PropTypes.array,

      onEvaluationChange: React.PropTypes.func,
      onQuestionsChange: React.PropTypes.func,
      onAnswerChange: React.PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      mode: 'Select',
      tags: [],
      allTags: defaultTags,
      allQuestions: require('./TEMP'),
      hideQuestions: [],
      bufferQuestion: { id: 0, qtype: 'trueFalse', question: { text: '' }, tags: [], fields: {} },
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags,
      mode: props.mode,
      hideQuestions: props.hideQuestions,
      allQuestions: props.allQuestions,
      bufferQuestion: props.bufferQuestion,
    };

    this.changeTags = this.changeTags.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.matchQuestions = this.matchQuestions.bind(this);
    this.refreshAllQuestions = this.refreshAllQuestions.bind(this);
    this.onSubmitNewQuestion = this.onSubmitNewQuestion.bind(this);
    this.removeQuestion = this.removeQuestion.bind(this);
    this.setTypeBuffer = this.setTypeBuffer.bind(this);

    this.renderQuestion = this.renderQuestion.bind(this);
  }

  onSubmitNewQuestion(object) {
    const allQuestions = [...this.state.allQuestions, object];
    this.setState({ allQuestions });
    this.setState({ mode: 'Select' });
    this.addQuestion(object);
  }

  setTypeBuffer(value) {
    const bufferQuestion = this.state.bufferQuestion;
    bufferQuestion.qtype = Object.keys(questionTypes)[value];
    this.setState({ bufferQuestion });
  }

  changeTags(value, tags) {
    return this.setState({ tags });
  }

  addQuestion(question) {
    const questions = [...this.props.questions];
    if (!questions.find(q => q.id === question.id)) {
      this.props.onQuestionsChange([...questions, question]);
    }
  }

  removeQuestion(question, index, option) {
    if (option === 'evaluation') {
      const questions = [...this.props.questions];
      questions.splice(index, 1);
      this.props.onQuestionsChange(questions);
    } else {
      this.setState({ hideQuestions: [...this.state.hideQuestions, question.id] });
    }
  }

  updateEvaluation(evaluation) {
    if (this.props.onEvaluationChange) this.props.onEvaluationChange(evaluation);
  }

  matchQuestions() {
    const tags = this.state.tags;
    return this.state.allQuestions
      .filter(question => tags.every(tag => question.tags.indexOf(tag.label) > -1));
  }

  refreshAllQuestions() {
    this.setState({ hideQuestions: [] });
  }

  renderQuestion(question, identifier) {
    const { answers, onAnswerChange } = this.props;
    const props = {
      identifier,
      question,
      onAnswerChange: answer => onAnswerChange(question.id, answer),
      answer: answers[question.id],
    };
    return (
      <div key={question.id} style={styles.question}>
        {questionFactory(question.qtype, props)}
        <hr />
      </div>
    );
  }

  renderEvaluation(evaluation, questions) {
    return (
      <Panel>
        <h3>{evaluation.title || 'No title'}</h3>
        <p>{evaluation.description || ''}</p>
        <hr />
        {questions.map(this.renderQuestion)}
      </Panel>
    );
  }

  renderQuestionPool(questions, filteredQuestions) {
    return (
      <Panel header="Question pool">
        <Form style={styles.formQuestions}>
          <DropdownButton
            id="mode-dropdown"
            title={this.state.mode}
            onSelect={e => this.setState({ mode: e })}
          >
            <MenuItem eventKey="Select">Select</MenuItem>
            <MenuItem eventKey="Custom">Custom</MenuItem>
          </DropdownButton>

          {renderIf(this.state.mode === 'Custom')(() =>
            <DropdownButton
              style={styles.button}
              bsStyle={'default'}
              title={questionTypes[this.state.bufferQuestion.qtype]}
              onSelect={this.setTypeBuffer}
              id={0}
            >
              {Object.keys(questionTypes).map((tag, index) =>
                <MenuItem
                  key={index}
                  eventKey={index}
                  active={this.state.bufferQuestion.qtype === tag}
                >
                  {tag}
                </MenuItem>
              )}
            </DropdownButton>
          )}

          <div style={styles.selectTag}>
            <Select
              multi
              simpleValue={false}
              disabled={false}
              value={this.state.tags}
              options={this.props.allTags}
              onChange={this.changeTags}
              placeholder={'Tags'}
            />
          </div>

          <Icon name="random" style={styles.formIcon} />
          <Icon name="refresh" style={styles.formIcon} onClick={this.refreshAllQuestions} />
        </Form>

        <div>
          {renderIf(this.state.mode === 'Select')(() =>
            filteredQuestions.map(this.renderQuestion)
          )}
        </div>
      </Panel>
    );
  }

  render() {
    const filteredQuestions = this.matchQuestions();
    const { evaluation, questions } = this.props;

    return (
      <Row style={styles.container}>
        <Col style={styles.rigth} xs={12} sm={12} md={5}>
          {this.renderQuestionPool(questions, filteredQuestions)}
        </Col>
        <Col style={styles.left} xs={12} sm={12} md={7}>
          {this.renderEvaluation(evaluation, questions)}
        </Col>
      </Row>
    );
  }
}

const styles = {
  container: {},
  left: {
    padding: 10,
  },
  rigth: {
    padding: 10,
    // borderStyle: 'solid',
    // borderLeftWidth: 1,
    // borderLeftStyle: 'solid',
    // borderLeftColor: 'rgb(231, 231, 231)',
    // borderRightWidth: 0,
    // borderTopWidth: 0,
    // borderBottomWidth: 0,
  },
  selectTag: {
    width: '100%',
    height: '100%',
    marginLeft: 5,
  },
  formQuestions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  question: {
    margin: 10,
    paddingLeft: 10,
    paddingRight: 10,
  },
  questionTypesTitle: {
    fontSize: 24,
  },
  tag: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
    margin: 3,
    padding: 3,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
  },
  tagsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  questionTitleTags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionIcons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addIcon: {
    color: Colors.MAIN,
    paddingRight: 10,
  },
  removeIcon: {
    color: Colors.RED,
    paddingLeft: 10,
  },
  formIcon: {
    marginLeft: 10,
    marginRight: 5,
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    margin: 5,
  },
};
