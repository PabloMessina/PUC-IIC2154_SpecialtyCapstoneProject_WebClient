import React, { Component } from 'react';
import { Checkbox } from 'react-bootstrap';

import { Colors } from '../../styles';
import compose, { QuestionPropTypes } from './question';


class MultiChoice extends Component {

  static get propTypes() {
    return QuestionPropTypes;
  }

  static get defaultProps() {
    return { answer: [] };
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.onCheck = this.onCheck.bind(this);
  }

  onCheck(answers, i, selectable) {
    const { onAnswerChange } = this.props;
    const index = answers.indexOf(i);

    // Remove if present
    if (index >= 0) {
      const changed = [...answers];
      changed.splice(index, 1);
      return onAnswerChange(changed);

    // Add to answerss
    } else {
      const changed = [...answers, i];
      const selected = changed.length;

      // Remove early selected till match max selection size and left one space for the current value
      if (selected > selectable) Array(selected - selectable).fill(0).forEach(() => changed.shift());
      return onAnswerChange(changed);
    }
  }

  renderResponder() {
    const { question, answer, disabled } = this.props;
    const { fields } = question;
    const { selectable, choices } = fields;

    return (
      <div style={styles.container}>
        <div style={styles.column}>
          {choices.map((choice, i) => (
            <Checkbox
              key={i}
              disabled={disabled}
              checked={answer.includes(i)}
              onChange={() => this.onCheck(answer, i, selectable)}
            >
              {choice.text}
            </Checkbox>
          ))}
          <p style={styles.instruction}>
            Select {selectable} option{selectable > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    );
  }

  renderEditor() {

  }

  render() {
    switch (this.props.mode) {
      case 'editor': return this.renderEditor();
      case 'responder': return this.renderResponder();
      case 'reader': return this.renderResponder();
      default: return null;
    }
  }
}

const styles = {
  container: {

  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  instruction: {
    marginTop: 5,
    fontSize: 14,
    color: Colors.GRAY,
  },
};

export default compose(MultiChoice);
