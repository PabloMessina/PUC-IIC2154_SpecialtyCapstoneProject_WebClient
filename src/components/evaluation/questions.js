/* eslint no-underscore-dangle:0 */

import React, { Component } from 'react';

import Select from 'react-select';
import {
  DropdownButton,
  MenuItem,
  Form,
  Button,
  Panel,
  Col,
  Row,
} from 'react-bootstrap';
import { TrueFalse, MultiChoice, TShort } from '../questions';
import Icon from 'react-fa';

// import renderIf from 'render-if';

import { Colors } from '../../styles';

const QUESTION_TYPES = {
  multiChoice: 'Multi choice',
  tshort: 'Short text',
  trueFalse: 'True - False',
};

const EMPTY_QUESTION = {
  id: 1,
  qtype: Object.keys(QUESTION_TYPES)[0],
  content: {
    insert: '¿Sed ut posuere velit?',
  },
  tags: [''],
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
      // In memory new custom question
      temporal: React.PropTypes.any,

      // From parent
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
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
      mode: 'Select',
      selected: [],
      tags: [
        { label: 'Tag 1', value: 'Tag 1' },
        { label: 'Tag 2', value: 'Tag 2' },
        { label: 'Tag 3', value: 'Tag 3' },
        { label: 'Tag 4', value: 'Tag 4' },
        { label: 'Tag 5', value: 'Tag 5' },
      ],
      pool: require('./TEMP'),
      hidden: [],
      temporal: EMPTY_QUESTION,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags,
      selected: props.selected,
      mode: props.mode,
      hidden: props.hidden,
      pool: props.pool,
      temporal: props.temporal,
    };

    this.renderQuestion = this.renderQuestion.bind(this);
    this.renderEvaluation = this.renderEvaluation.bind(this);
    this.renderQuestionPool = this.renderQuestionPool.bind(this);
    this.renderQuestionList = this.renderQuestionList.bind(this);
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

  renderQuestion(props, identifier) {
    const { onAnswerChange, onFieldsChange } = this.props;
    const question = props.question;
    const element = questionFactory(question.qtype, {
      ...props,
      identifier,
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

  renderAddCustom() {
    const { temporal, selected, tags } = this.state;
    const element = questionFactory(temporal.qtype, {
      question: temporal,
      answer: temporal.answer,
      fields: temporal.fields,
      disabled: false,
      mode: 'editor',
      onAnswerChange: answer => this.setState({ temporal: { ...this.state.temporal, answer } }),
      onFieldsChange: fields => this.setState({ temporal: { ...this.state.temporal, fields } }),
    });

    return (
      <Panel collapsible defaultExpanded bsStyle="primary" header={<h3>Custom question</h3>}>
        <DropdownButton
          style={styles.button}
          bsStyle="default"
          title={QUESTION_TYPES[temporal.qtype]}
          onSelect={qtype => this.setState({ temporal: { ...temporal, qtype, fields: undefined, answer: undefined } })}
          id="questiom-type-dropdown"
        >
          {Object.keys(QUESTION_TYPES).map(tag =>
            <MenuItem
              key={tag}
              eventKey={tag}
              active={temporal.qtype === tag}
            >
              {QUESTION_TYPES[tag]}
            </MenuItem>
          )}
        </DropdownButton>
        <Select
          multi
          simpleValue={false}
          value={selected}
          options={tags}
          onChange={(value, labels) => this.setState({ selected: labels })}
          placeholder={'Tags'}
        />
        <hr />
        {element}
      </Panel>
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

  renderEvaluation() {
    const { evaluation, questions, answers, onQuestionRemove } = this.props;
    const objects = questions.map(question => ({
      question,
      answer: answers[question.id],
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
            {this.renderQuestion(question, i)}
            <div style={styles.icons} onClick={() => onQuestionRemove(question.question)}>
              <Icon size="lg" name="minus" style={{ color: Colors.RED }} />
            </div>
          </div>
        ))}
      </Panel>
    );
  }

  render() {
    return (
      <Row style={styles.container}>
        <Col style={styles.rigth} xs={12} sm={12} md={5}>
          <Col xs={12}>
            {this.renderAddCustom()}
          </Col>
          <Col xs={12}>
            {this.renderQuestionPool()}
          </Col>
        </Col>
        <Col style={styles.left} xs={12} sm={12} md={7}>
          {this.renderEvaluation()}
        </Col>
      </Row>
    );
  }
}

const styles = {
  container: {},
  left: {

  },
  rigth: {
    // borderStyle: 'solid',
    // borderLeftWidth: 1,
    // borderLeftStyle: 'solid',
    // borderLeftColor: 'rgb(231, 231, 231)',
    // borderRightWidth: 0,
    // borderTopWidth: 0,
    // borderBottomWidth: 0,
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
    // margin: 10,
    // paddingLeft: 10,
    // paddingRight: 10,
  },
  // QUESTION_TYPESTitle: {
  //   fontSize: 24,
  // },
  // tag: {
  //   backgroundColor: Colors.MAIN,
  //   color: Colors.WHITE,
  //   margin: 3,
  //   padding: 3,
  //   paddingLeft: 15,
  //   paddingRight: 15,
  //   borderRadius: 5,
  // },
  // tagsContainer: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'flex-end',
  // },
  // questionTitleTags: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom: 10,
  // },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icons: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 50, marginRight: 10,
  },
  formIcon: {
    marginLeft: 5,
    marginRight: 5,
  },
  button: {
    margin: 5,
  },
};
