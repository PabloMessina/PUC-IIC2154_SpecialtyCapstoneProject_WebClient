import React, { Component } from 'react';

import Select from 'react-select';
import {
  DropdownButton,
  MenuItem,
  Form,
  Col,
  Row,
} from 'react-bootstrap';
import MultiChoice from '../questions/multi-choice';
import TShort from '../questions/tshort';
import TrueFalse from '../questions/true-false';
import NewQuestion from '../questions/new-question';
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
const defaultQuestions = [
  {
    _id: 1,
    _type: 'multiChoice',
    question: { text: '¿Sed ut posuere velit?' },
    tags: ['Tag 1', 'Tag 2'],
    fields: {
      selectable: 1,
      choices: [{ text: 'Option 1' }, { text: 'Option 2' }],
      answers: [1],
    },
  }, {
    _id: 2,
    _type: 'multiChoice',
    question: { text: ' Phasellus nec tortor vel dui ultrices facilisis.' +
      'Vestibulum nec turpis vitae est interdum porttitor sed nec enim.' +
      'Curabitur vel viverra mi, tempor aliquet nisl.' },
    tags: ['Tag 1'],
    fields: {
      selectable: 1,
      choices: [{ text: 'Option 1' }, { text: 'Option 2' }],
      answers: [1],
    },
  }, {
    _id: 3,
    _type: 'tshort',
    question: { text: 'Aliquam tempor risus dui, non sodales velit tempor quis.' +
      'Quisque eleifend diam purus, eu porttitor mauris tempor vel.' +
      'Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. ' },
    tags: ['Tag 2', 'Tag 3', 'Tag 4'],
    fields: {
      answers: ['Answ 1', 'Answ 2', 'Answ 3'],
    },
  }, {
    _id: 4,
    _type: 'tshort',
    question: { text: 'Quisque eleifend diam purus, eu porttitor mauris tempor vel.' +
      'Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. ' },
    tags: ['Tag 2', 'Tag 3', 'Tag 4'],
    fields: {
      answers: ['Answ 1', 'Answ 2'],
    },
  }, {
    _id: 5,
    _type: 'trueFalse',
    question: { text: 'Quisque eleifend diam purus, eu porttitor mauris tempor vel.' +
    'Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. ' },
    tags: ['Tag 5'],
    fields: {
      answer: 1,
    },
  }];

export default class Questions extends Component {

  static get propTypes() {
    return {
      mode: React.PropTypes.string,
      questions: React.PropTypes.array,
      allQuestions: React.PropTypes.array,
      tags: React.PropTypes.array,
      allTags: React.PropTypes.array,
      hideQuestions: React.PropTypes.array,
      bufferQuestion: React.PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      mode: 'Select',
      tags: [],
      allTags: defaultTags,
      questions: [],
      allQuestions: [...defaultQuestions],
      hideQuestions: [],
      bufferQuestion: { _id: 0, _type: 'trueFalse', question: { text: '' }, tags: [], fields: {} },
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags,
      questions: props.questions,
      mode: props.mode,
      hideQuestions: props.hideQuestions,
      allQuestions: props.allQuestions,
      bufferQuestion: props.bufferQuestion,
    };

    this.changeTags = this.changeTags.bind(this);
    this.questionFactory = this.questionFactory.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.matchQuestions = this.matchQuestions.bind(this);
    this.refreshAllQuestions = this.refreshAllQuestions.bind(this);
    this.NewQuestion = this.NewQuestion.bind(this);
    this.removeQuestion = this.removeQuestion.bind(this);
    this.setTypeBuffer = this.setTypeBuffer.bind(this);
  }

  setTypeBuffer(value) {
    const bufferQuestion = this.state.bufferQuestion;
    bufferQuestion._type = Object.keys(questionTypes)[value];
    this.setState({ bufferQuestion });
  }

  changeTags(value, tags) {
    return this.setState({ tags });
  }

  questionFactory(_type, props) {
    switch (_type) {
      case 'trueFalse': return <TrueFalse {...props} />;
      case 'multiChoice': return <MultiChoice {...props} />;
      case 'tshort': return <TShort {...props} />;
      default: return null;
    }
  }

  addQuestion(question) {
    let questions = [...this.state.questions];
    if (!questions.includes(question)) {
      questions = [...questions, question];
    }
    this.setState({ questions });
  }

  removeQuestion(question, index, option) {
    if (option === 'evaluation') {
      const questions = [...this.state.questions];
      questions.splice(index, 1);
      this.setState({ questions });
    } else {
      this.setState({ hideQuestions: [...this.state.hideQuestions, question._id] });
    }
  }

  matchQuestions() {
    const tags = this.state.tags;
    return this.state.allQuestions
      .filter(question => tags.every(tag => question.tags.indexOf(tag.label) > -1));
  }

  refreshAllQuestions() {
    this.setState({ hideQuestions: [] });
  }

  NewQuestion(object) {
    const allQuestions = [...this.state.allQuestions, object];
    this.setState({ allQuestions });
    this.setState({ mode: 'Select' });
    this.addQuestion(object);
  }

  render() {
    const filteredQuestions = this.matchQuestions();
    return (
      <Row style={styles.container}>
        <Col style={styles.left} xs={12} sm={7} md={7}>
          <p style={styles.title}>Evaluation Name</p>
          <p>Evaluation description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Phasellus auctor imperdiet pulvinar. Nam quam risus, eleifend id pulvinar ac,
          maximus eu massa. Cras dignissim arcu ac nunc porta maximus. Aliquam sapien quam,
          bibendum quis neque efficitur, gravida finibus eros.
          </p>
          {this.state.questions.map((question, index) => {
            const props = {
              question: question.question,
              tags: question.tags,
              fields: question.fields,
              permission: 'reader',
            };
            return (<div key={index} style={styles.question}>
              <hr />
              <div style={styles.questionTitleTags}>
                <p style={styles.questionTypesTitle}>#{question._id} - {questionTypes[question._type]}</p>
                <div style={styles.tagsContainer}>
                  {question.tags.map((tag, j) =>
                    <p key={j} style={styles.tag}>{tag}</p>
                  )}
                </div>
              </div>
              {this.questionFactory(question._type, props)}
              <div style={styles.questionIcons}>
                <Icon
                  name="close fa-2x"
                  style={styles.removeIcon}
                  onClick={() => this.removeQuestion(question, index, 'evaluation')}
                />
              </div>
            </div>);
          })}
        </Col>
        <Col style={styles.rigth} xs={12} sm={5} md={5}>
          <Form style={styles.formQuestions}>
            <DropdownButton
              id={'modeDropdown'}
              title={this.state.mode}
              onSelect={(e) => this.setState({ mode: e })}
            >
              <MenuItem eventKey="Select">Select</MenuItem>
              <MenuItem eventKey="Custom">Custom</MenuItem>
            </DropdownButton>
            {renderIf(this.state.mode === 'Custom')(() =>
              <DropdownButton
                style={styles.button}
                bsStyle={'default'}
                title={questionTypes[this.state.bufferQuestion._type]}
                onSelect={this.setTypeBuffer}
                id={0}
              >
                {Object.keys(questionTypes).map((tag, index) =>
                  <MenuItem
                    key={index}
                    eventKey={index}
                    active={this.state.bufferQuestion._type === tag}
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
            <Icon
              name="random"
              style={styles.formIcon}
            />
            <Icon
              name="refresh"
              style={styles.formIcon}
              onClick={this.refreshAllQuestions}
            />
          </Form>
          <div>
            {renderIf(this.state.mode === 'Select')(() =>
            filteredQuestions.map((question, index) => {
              if (!this.state.questions.includes(question) &&
                  !this.state.hideQuestions.includes(question._id)) {
                const props = {
                  question: question.question,
                  tags: question.tags,
                  fields: question.fields,
                  permission: 'reader',
                };
                return (
                  <div key={index} style={styles.question}>
                    <hr />
                    <div style={styles.questionTitleTags}>
                      <p style={styles.questionTypesTitle}>#{question._id} - {questionTypes[question._type]}</p>
                      <div style={styles.tagsContainer}>
                        {question.tags.map((tag, j) =>
                          <p key={j} style={styles.tag}>{tag}</p>
                        )}
                      </div>
                    </div>
                    {this.questionFactory(question._type, props)}
                    <div style={styles.questionIcons}>
                      <Icon
                        name="check fa-2x"
                        style={styles.addIcon}
                        onClick={() => this.addQuestion(question)}
                      />
                      <Icon
                        name="close fa-2x"
                        style={styles.removeIcon}
                        onClick={() => this.removeQuestion(question, index, 'allQuestions')}
                      />
                    </div>
                  </div>);
              } return null;
            })
            )}
            {renderIf(this.state.mode === 'Custom')(() => {
              const props = {
                _id: this.state.allQuestions.length + 1,
                typeQuestion: this.state.bufferQuestion._type,
                tags: this.state.tags.map((item) => item.label),
                onSubmit: this.NewQuestion,
              };
              return (<NewQuestion {...props} />);
            }
            )}
          </div>
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
    borderStyle: 'solid',
    borderLeftWidth: 1,
    borderLeftStyle: 'solid',
    borderLeftColor: 'rgb(231, 231, 231)',
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 28,
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
