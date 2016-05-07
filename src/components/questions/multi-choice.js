import React, { Component } from 'react';
import {
  Checkbox,
  Button,
  FormControl,
} from 'react-bootstrap';
import renderIf from 'render-if';

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
    debugger;
    super(props);
    this.state = {};
    this.onCheck = this.onCheck.bind(this);
    this.onFieldsChange = this.onFieldsChange.bind(this);
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

  onFieldsChange(event, index) {
    debugger;
    // const answer = this.props.answer;
    // fields.choices[index].text = event.target.value;
    // this.props.changeFields(this.props._id, fields);
    // this.props.onFieldsChange();
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
    const { question, answer, disabled } = this.props;
    const { fields } = question;
    const { selectable, choices } = fields;

    return (
      <form style={styles.container}>
        <div style={styles.column}>
          {choices.map((choice, i) => (
            <div key={i} style={styles.choice}>
              <Checkbox
                checked={answer.includes(i)}
                disabled={disabled}
                onChange={() => this.onCheck(answer, i, selectable)}
              />
              <FormControl
                type="text"
                value={choice.text}
                placeholder="Enter option"
                onChange={(e) => this.onFieldsChange(e, i)}
                disabled={disabled}
              />
              {renderIf(disabled && i > 0)(() => (
                <Button
                  style={styles.button}
                  bsStyle="link"
                  bsSize="large"
                  type="button"
                  onClick={e => this.removeChoice(e, i)}
                >
                  -
                </Button>
              ))}
            </div>
          ))}
          <p style={styles.instruction}>
            Select {selectable} option{selectable > 1 ? 's' : ''}
          </p>
          {renderIf(!disabled)(() =>
            <Button
              style={[styles.button, styles.add]}
              bsStyle="link"
              type="button"
              onClick={this.addChoice}
            >
              Add a choice
            </Button>
          )}

        </div>
      </form>
    );
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
