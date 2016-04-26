import React, { Component } from 'react';

import Select from 'react-select';
import {
  DropdownButton,
  MenuItem,
//   FormControl,
  Form,
  Col,
  Row,
} from 'react-bootstrap';
import Correlation from '../questions/correlation';
import MultiChoice from '../questions/multi-choice';
import TShort from '../questions/tshort';
import TrueFalse from '../questions/true-false';

import Icon from 'react-fa';

// import QuestionContainer from '../questions/question-container';
// import renderIf from 'render-if';
//
import { Colors } from '../../styles';

const questionTypes = {
  multiChoice: 'Multi choice',
  tshort: 'Short text',
  correlation: 'Correlation',
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
    _type: 'correlation',
    question: { text: ' Phasellus nec tortor vel dui ultrices facilisis.' +
      'Vestibulum nec turpis vitae est interdum porttitor sed nec enim.' +
      'Curabitur vel viverra mi, tempor aliquet nisl.' },
    tags: ['Tag 1'],
    fields: {
      keys: [{ text: 'Option1' }, { text: 'Option2' }],
      values: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }],
      answers: [[0, 1], [1, 2], [1, 3]],
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
    };
  }

  static get defaultProps() {
    return {
      mode: 'Select',
      tags: [],
      allTags: defaultTags,
      questions: [],
      allQuestions: defaultQuestions,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags,
      questions: props.questions,
      mode: props.mode,
    };
    this.changeTags = this.changeTags.bind(this);
    this.questionFactory = this.questionFactory.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.matchQuestions = this.matchQuestions.bind(this);
  }

  changeTags(value, tags) {
    return this.setState({ tags });
  }

  questionFactory(_type, props) {
    switch (_type) {
      case 'trueFalse': return <TrueFalse {...props} />;
      case 'multiChoice': return <MultiChoice {...props} />;
      case 'tshort': return <TShort {...props} />;
      case 'correlation': return <Correlation {...props} />;
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
    }
  }

  matchQuestions() {
    debugger;
    const tags = this.state.tags;
    return this.props.allQuestions
      .filter(question => tags.every(tag => question.tags.indexOf(tag.label) > -1));
  }

  render() {
    const filteredQuestions = this.matchQuestions();
    return (
      <Row style={styles.container}>
        <Col style={styles.left} xs={12} sm={6} md={6}>
          <p style={styles.title}>Evaluation Name</p>
          <p>Evaluation description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Phasellus auctor imperdiet pulvinar. Nam quam risus, eleifend id pulvinar ac,
          maximus eu massa. Cras dignissim arcu ac nunc porta maximus. Aliquam sapien quam,
          bibendum quis neque efficitur, gravida finibus eros.
          </p>
          {this.state.questions.map((question, index) => {
            const props = {
              question,
              permission: 'reader',
            };
            return (<div style={styles.question}>
              <hr />
              <div style={styles.questionTitleTags}>
                <p style={styles.questionTypesTitle}>#{question._id} - {questionTypes[question._type]}</p>
                <div style={styles.tagsContainer}>
                  {question.tags.map((tag) =>
                    <p style={styles.tag}>{tag}</p>
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
        <Col style={styles.rigth} xs={12} sm={6} md={6}>
          <Form style={styles.formQuestions}>
            <DropdownButton
              id={'modeDropdown'}
              title={this.state.mode}
              onSelect={(e) => this.setState({ mode: e })}
            >
              <MenuItem eventKey="Select">Select</MenuItem>
              <MenuItem eventKey="Custom">Custom</MenuItem>
            </DropdownButton>
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
            <Icon name="random fa-x" style={styles.randomIcon} />
          </Form>
          <div>
            {filteredQuestions.map((question) => {
              const props = {
                question,
                permission: 'reader',
              };
              return (<div style={styles.question}>
                <hr />
                <div style={styles.questionTitleTags}>
                  <p style={styles.questionTypesTitle}>#{question._id} - {questionTypes[question._type]}</p>
                  <div style={styles.tagsContainer}>
                    {question.tags.map((tag) =>
                      <p style={styles.tag}>{tag}</p>
                    )}
                  </div>
                </div>
                {this.questionFactory(question._type, props)}
                <div style={styles.questionIcons}>
                  <Icon name="check fa-2x" style={styles.addIcon} onClick={() => this.addQuestion(question)} />
                  <Icon name="close fa-2x" style={styles.removeIcon} />
                </div>
              </div>);
            })}
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
  randomIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
};
