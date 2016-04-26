import React, { Component } from 'react';
import Select from 'react-select';
import {
  DropdownButton,
  MenuItem,
  FormControl,
  Form,
} from 'react-bootstrap';
import Correlation from '../questions/correlation';
import MultiChoice from '../questions/multi-choice';
import TShort from '../questions/tshort';
import TrueFalse from '../questions/true-false';
import QuestionContainer from '../questions/question-container';
import renderIf from 'render-if';

import { Colors } from '../../styles';
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
      numberRandomQuestions: React.PropTypes.number,
      tags: React.PropTypes.array,
      allTags: React.PropTypes.array,
      questions: React.PropTypes.array,
      allQuestionsComponents: React.PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      mode: 'random',
      numberRandomQuestions: 1,
      tags: [],
      questions: [],
      allTags: [
        { label: 'Tag 1', value: 'Tag 1' },
        { label: 'Tag 2', value: 'Tag 2' },
        { label: 'Tag 3', value: 'Tag 3' },
        { label: 'Tag 4', value: 'Tag 4' },
        { label: 'Tag 5', value: 'Tag 5' },
      ],
      allQuestionsComponents: [],
    };
  }
  constructor(props) {
    super(props);
    this.changeMode = this.changeMode.bind(this);
    this.changeNumberRandomQuestions = this.changeNumberRandomQuestions.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.questionFactory = this.questionFactory.bind(this);
    this.matchQuestions = this.matchQuestions.bind(this);
    this.renderQuestions = this.renderQuestions.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.state = {
      mode: props.mode,
      numberRandomQuestions: props.numberRandomQuestions,
      tags: props.tags,
      allTags: props.allTags,
      questions: props.questions,
      allQuestions: defaultQuestions,
      allQuestionsComponents: this.init(defaultQuestions),
    };
  }

  init(questions) {
    const components = [];
    questions.forEach((question, index) => {
      const options = {
        question,
        permission: 'reader',
      };
      const buttons = [
        { text: 'add', onClick: () => this.addQuestion(question._id), style: styles.addQuestion },
      ];
      const component = (<QuestionContainer
        component={this.questionFactory(question._type, options)}
        title={`Question ${question._id}`}
        tags={question.tags}
        buttons={buttons}
        key={index}
        open
        collapsible={false}
      />);
      components.push({ _id: question._id, component });
    });
    return components;
  }

  addQuestion(_id) {
    debugger;
    const questions = this.state.questions;
    questions.push(
      this.state.allQuestionsComponents.find((item) => item._id === _id)
    );
    this.setState({ questions });
  }

  handleSelectChange(value, tags) {
    this.forceUpdate();
    return this.setState({ tags });
  }

  changeMode(e) {
    this.setState({ mode: e });
  }

  changeNumberRandomQuestions(e) {
    this.setState({ numberRandomQuestions: e.target.value });
  }

  /**
   * Return a question component
   * @param  {string} _type   type of question
   * @param  {object} props   props of component
   * @return {component}
   */
  questionFactory(_type, props) {
    switch (_type) {
      case 'trueFalse': return <TrueFalse {...props} />;
      case 'multiChoice': return <MultiChoice {...props} />;
      case 'tshort': return <TShort {...props} />;
      case 'correlation': return <Correlation {...props} />;
      default: return null;
    }
  }

  /**
   * Return questions with tags selected by the user
   * @return {array}
   */
  matchQuestions() {
    const tags = this.state.tags;
    return this.state.allQuestions
      .filter(question => tags.every(tag => question.tags.indexOf(tag.label) > -1));
  }

  renderQuestions(mquestions) {
    if (this.state.mode !== 'create') {
      const returns = [];
      mquestions.forEach((question) => {
        returns.push(
          this.state.allQuestionsComponents
          .filter((item) => item._id === question._id)
          .map((item) => item.component)
        );
      });
      return returns;
    }
    return null;
  }

  render() {
    const filtredQuestions = this.matchQuestions();
    return (
      <div style={styles.container}>
        <div style={styles.mainQuestions}>
          <div>
            <Form style={styles.optionBar}>
              <DropdownButton
                id={'modeDropdown'}
                title={this.state.mode}
                onSelect={this.changeMode}
                style={styles.formMode}
              >
                <MenuItem eventKey="random">Random</MenuItem>
                <MenuItem eventKey="manually">Manually</MenuItem>
                <MenuItem eventKey="create">Create</MenuItem>
              </DropdownButton>
              {renderIf(this.state.mode === 'random')(() =>
                <FormControl
                  type="number"
                  min="1"
                  value={this.state.numberRandomQuestions}
                  onChange={this.changeNumberRandomQuestions}
                  style={styles.numberRandomQuestions}
                />
              )}
              <div style={styles.formTags}>
                <Select
                  multi
                  simpleValue={false}
                  disabled={false}
                  value={this.state.tags}
                  options={this.state.allTags}
                  onChange={this.handleSelectChange}
                  placeholder={'Tags'}
                />
              </div>
            </Form>
            <div style={styles.search}>
              {this.renderQuestions(filtredQuestions)}
              {renderIf(filtredQuestions.length < 1)(() =>
                <p>No questions found :c</p>
              )}
            </div>
          </div>
          <div style={styles.preview}>
            {this.renderQuestions(this.state.questions)}
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {

  },
  optionBar: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  formMode: {
    marginRight: 5,
  },
  numberRandomQuestions: {
    width: 80,
    marginLeft: 5,
    marginRight: 5,
  },
  formTags: {
    width: '100%',
    height: '100%',
    marginLeft: 5,
  },
  search: {
    marginTop: 0,
    backgroundColor: 'white',
    padding: 0,
  },
  preview: {
    backgroundColor: 'white',
  },
  addQuestion: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
    fontSize: 14,
    padding: 3,
    paddingLeft: 10,
    paddingRight: 10,
  },
  removeQuestion: {
    backgroundColor: Colors.RED,
    color: Colors.WHITE,
  },
  mainQuestions: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
};
