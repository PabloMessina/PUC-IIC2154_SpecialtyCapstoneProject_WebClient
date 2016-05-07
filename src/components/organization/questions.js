import React, { Component } from 'react';
import { Grid,
  // Row,
  Col,
  Panel,
  Button,
  // Table,
  // ControlLabel,
  DropdownButton,
  MenuItem,
  Glyphicon,
} from 'react-bootstrap';
import MultiChoice from '../questions/multi-choice';
import TShort from '../questions/tshort';
import TrueFalse from '../questions/true-false';
import NewQuestion from '../questions/new-question';
import Select from 'react-select';
import renderIf from 'render-if';

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

export default class CourseTab extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      questions: React.PropTypes.array,
      allTags: React.PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      questions: defaultQuestions,
      allTags: defaultTags,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      questions: props.questions,
      allTags: props.allTags,
      createNewQuestion: false,
      bufferQuestion: { _id: 0, _type: 'trueFalse', question: { text: '' }, tags: [], fields: {} },
    };
    this.questionFactory = this.questionFactory.bind(this);
    this.onCreateQuestion = this.onCreateQuestion.bind(this);
    this.onSelectTags = this.onSelectTags.bind(this);
    this.onSetTypeBuffer = this.onSetTypeBuffer.bind(this);
    this.onSubmitNewQuestion = this.onSubmitNewQuestion.bind(this);
  }

  onCreateQuestion() {
    this.setState({ createNewQuestion: true });
  }

  onSelectTags(value, tags) {
    const question = { ...this.state.bufferQuestion };
    question.tags = tags.map((item) => item.label);
    this.setState({ bufferQuestion: question });
  }

  onSetTypeBuffer(value) {
    const bufferQuestion = this.state.bufferQuestion;
    bufferQuestion._type = Object.keys(questionTypes)[value];
    this.setState({ bufferQuestion });
  }

  onSubmitNewQuestion() {
    console.log('el pato es muy flojito y no me ayuda </3');
  }

  questionFactory(_type, props) {
    switch (_type) {
      case 'trueFalse': return <TrueFalse {...props} />;
      case 'multiChoice': return <MultiChoice {...props} />;
      case 'tshort': return <TShort {...props} />;
      default: return null;
    }
  }

  render() {
    return (
      <Grid>
        <Col xs={12} md={9}>
          {renderIf(this.state.createNewQuestion)(
            <Panel style={styles.newQuestionContainer}>
              <div style={styles.optionQuestions}>
                <DropdownButton
                  style={styles.button}
                  bsStyle={'default'}
                  title={questionTypes[this.state.bufferQuestion._type]}
                  onSelect={this.onSetTypeBuffer}
                  id={0}
                >
                  {Object.values(questionTypes).map((tag, index) =>
                    <MenuItem
                      key={index}
                      eventKey={index}
                      active={this.state.bufferQuestion._type === tag}
                    >
                      {tag}
                    </MenuItem>
                  )}
                </DropdownButton>
                <div style={styles.selectTag}>
                  <Select
                    multi
                    simpleValue={false}
                    disabled={false}
                    value={this.state.bufferQuestion.tags}
                    options={this.props.allTags}
                    onChange={this.onSelectTags}
                    placeholder={'Select tags'}
                  />
                </div>
              </div>
              <div style={styles.newQuestionForm}>
                {(() => {
                  const question = this.state.bufferQuestion;
                  const props = {
                    _id: 0,
                    typeQuestion: question._type,
                    tags: question.tags,
                    onSubmit: this.onSubmitNewQuestion,
                  };
                  return (<NewQuestion {...props} />);
                })()}
              </div>
            </Panel>
          )}
          <Panel style={styles.questionPool}>
          {this.state.questions.map((question, index) => {
            const props = {
              question: question.question,
              tags: question.tags,
              fields: question.fields,
              permission: 'reader',
            };
            return (
              <div>
                {renderIf(index > 0)(
                  <hr />
                )}
                {this.questionFactory(question._type, props)}
              </div>
            );
          }
          )}
          </Panel>
        </Col>
        <Col xs={12} md={3}>
          <Panel>
            <h4>Questions</h4>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vivamus ac mi ultrices, accumsan lorem vitae, porta eros.
            </p>
            <hr />
            <div style={styles.createQuestionButtonContainer}>
              <Button bsStyle="primary" bsSize="small" style={styles.createNewQuestion} onClick={this.onCreateQuestion}>
                <Glyphicon glyph="plus" /> Create question
              </Button>
            </div>
          </Panel>
        </Col>
      </Grid>
    );
  }
}

const styles = {
  container: {
  },
  questionPool: {
    padding: 15,
  },
  newQuestionContainer: {
    padding: 15,
  },
  newQuestionForm: {
  },
  createQuestionButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  optionQuestions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectTag: {
    width: '100%',
    height: '100%',
    marginLeft: 5,
  },
};
