import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import Correlation from './correlation';
import MultiChoice from './multi-choice';
import TShort from './tshort';
import TrueFalse from './true-false';
import NewQuestion from './new-question';


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
        question: { text: ' Phasellus nec tortor vel dui ultrices facilisis. Vestibulum nec turpis vitae est interdum porttitor sed nec enim. Curabitur vel viverra mi, tempor aliquet nisl.' },
        tags: ['Tag 1'],
        fields: {
          keys: [{ text: 'Option1' }, { text: 'Option2' }],
          values: [{ text: 'A' }, { text: 'B' }, { text: 'C' }, { text: 'D' }],
          answers: [[0, 1], [1, 2], [1, 3]],
        },
      }, {
        _id: 3,
        _type: 'tshort',
        question: { text: 'Aliquam tempor risus dui, non sodales velit tempor quis. Quisque eleifend diam purus, eu porttitor mauris tempor vel. Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. ' },
        tags: ['Tag 2', 'Tag 3', 'Tag 4'],
        fields: {
          answers: ['Answ 1', 'Answ 2', 'Answ 3'],
        },
      }, {
        _id: 4,
        _type: 'tshort',
        question: { text: 'Quisque eleifend diam purus, eu porttitor mauris tempor vel. Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. ' },
        tags: ['Tag 2', 'Tag 3', 'Tag 4'],
        fields: {
          answers: ['Answ 1', 'Answ 2'],
        },
      }, {
        _id: 5,
        _type: 'trueFalse',
        question: { text: 'Quisque eleifend diam purus, eu porttitor mauris tempor vel. Sed scelerisque nulla quis egestas ornare. Maecenas at mauris dolor. ' },
        tags: ['Tag 1'],
        fields: {
          answer: 1,
        },
      }],
    };
  }

  render() {
    const permission = 'reader';
    return (
      <Panel>
        <NewQuestion />
        {this.props.questions.map((question, i) => {
          switch (question._type) {
            case 'correlation': return (
              <Correlation
                key={i}
                question={question}
                permission={permission}
                collapsible
              />
            )
            case 'multiChoice': return (
              <MultiChoice
                key={i}
                question={question}
                permission={permission}
                collapsible
              />
            )
            case 'tshort': return (
              <TShort
                key={i}
                permission={permission}
                question={question}
                collapsible
              />
            )
            case 'trueFalse': return (
              <TrueFalse
                key={i}
                permission={permission}
                question={question}
                collapsible
              />);
            default: return null;
          }
        })}
      </Panel>
    );
  }
}

Questions.propTypes = {
  questions: React.PropTypes.node,
};
