import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import renderIf from 'render-if';

import Correlation from './correlation';
import MultiChoice from './multi-choice';
import TShort from './tshort';
import TrueFalse from './true-false';
import QuestionContainer from './question-container';


export default class Questions extends Component {

  static get defaultProps() {
    return {
      questions: [{
        _id: 1,
        _type: 'multiChoice',
        question: { text: '¿Sed ut posuere velit?' },
        tags: ['Tag 1', 'Tag2'],
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
          'Quisque eleifend diam purus, eu porttitor mauris tempor vel' +
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
        tags: ['Tag 1'],
        fields: {
          answer: 1,
        },
      }],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      current: null,
      questions: props.questions,
    };
    this.questionFactory = this.questionFactory.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
  }

  setCurrent(question, options) {
    this.setState({ current: this.questionFactory(question, options) });
  }

  questionFactory(_type, options) {
    switch (_type) {
      case 'trueFalse': return <TrueFalse {...options} />;
      case 'multiChoice': return <MultiChoice {...options} />;
      case 'tshort': return <TShort {...options} />;
      case 'correlation': return <Correlation {...options} />;
      default: return null;
    }
  }

  render() {
    const permission = 'editor';
    const options = {
      permission: 'editor',
      open: true,
      title: `Question ${this.state.questions.length + 1}` };
    return (
      <Panel>
        <div>
          <div style={styles.buttons}>
            <Button
              style={styles.button}
              onClick={() => this.setCurrent('correlation', options)}
            >
              Correlation
            </Button>
            <Button
              style={styles.button}
              onClick={() => this.setCurrent('multiChoice', options)}
            >
              MultiChoice
            </Button>
            <Button
              style={styles.button}
              onClick={() => this.setCurrent('trueFalse', options)}
            >
              True - False
            </Button>
            <Button
              style={styles.button}
              onClick={() => this.setCurrent('tshort', options)}
            >
              Text
            </Button>
          </div>
          {renderIf(this.state.current)(() =>
            <QuestionContainer
              component={this.state.current}
              title={'New question'}
            />)}
          {this.props.questions.map((question, i) => {
            const props = {
              key: i,
              collapsible: true,
              question,
              permission,
            };
            return (<QuestionContainer
              component={this.questionFactory(question._type, props)}
              title={`Question ${i}`}
            />);
          })}
        </div>
      </Panel>
    );
  }
}

Questions.propTypes = {
  questions: React.PropTypes.node,
};

const styles = {
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    marginLeft: 10,
    marginRight: 10,
  },
};
