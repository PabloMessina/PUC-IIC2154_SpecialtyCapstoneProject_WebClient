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
    return { answer: { choices: [] }, fields: { choices: [] } };
  }

  constructor(props) {
    super(props);
    this.onCheck = this.onCheck.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onRemoveChoice = this.onRemoveChoice.bind(this);
    this.onAddChoice = this.onAddChoice.bind(this);
  }

  onCheck(i, selectable = Infinity) {
    const answer = this.props.answer || { choices: [] };
    const index = answer.choices.indexOf(i);

    // Remove if present
    if (index >= 0) {
      const choices = [...answer.choices];
      choices.splice(index, 1);
      return this.props.onAnswerChange({ choices });

    // Add to answer
    } else {
      const choices = [...answer.choices, i];
      const selected = choices.length;

      // Remove early selected till match max selection size and left one space for the current value
      if (selected > selectable) Array(selected - selectable).fill(0).forEach(() => choices.shift());
      return this.props.onAnswerChange({ choices });
    }
  }

  onTextChange(value, index) {
    const { fields } = this.props;
    const choices = fields.choices && fields.choices.length ? fields.choices : [''];
    // Update value of changed
    choices[index] = { text: value };
    // Call event
    this.props.onFieldsChange({ choices });
  }

  onRemoveChoice(index) {
    const { fields } = this.props;
    const answer = this.props.answer || { choices: [] };

    // Remove field
    const fchoices = fields.choices && fields.choices.length ? fields.choices : [''];
    fchoices.splice(index, 1);

    // Keep in sync with current answers
    let achoices = answer.choices && answer.choices.length ? answer.choices : [];
    achoices = achoices.filter(c => c !== index).map(c => (c > index ? c - 1 : c));

    this.props.onFieldsChange({ choices: fchoices });
    this.props.onAnswerChange({ choices: achoices });
  }

  onAddChoice() {
    const { fields } = this.props;
    const choices = fields.choices && fields.choices.length ? fields.choices : [''];
    this.props.onFieldsChange({ choices: [...choices, ''] });
  }

  renderResponder() {
    const { fields, disabled } = this.props;
    const answer = this.props.answer || { choices: [] };
    const { selectable, choices } = fields;

    return (
      <div style={styles.container}>
        <div style={styles.column}>
          {choices.map((choice, i) => (
            <Checkbox
              key={i}
              disabled={disabled}
              checked={answer.choices.includes(i)}
              onChange={() => this.onCheck(i, selectable)}
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
    const { fields, disabled } = this.props;
    const answer = this.props.answer || { choices: [] };
    const selectable = answer.choices.length || 0;
    const choices = fields.choices && fields.choices.length ? fields.choices : [''];

    return (
      <form style={styles.container}>
        <div style={styles.column}>
          {choices.map((choice, i) => (
            <div key={i} style={styles.row}>
              <Checkbox
                checked={answer.choices.indexOf(i) > -1}
                disabled={disabled}
                onChange={() => this.onCheck(i)}
              />
              <FormControl
                type="text"
                value={choice.text}
                placeholder="Enter option"
                onChange={e => this.onTextChange(e.target.value, i)}
                disabled={disabled}
              />
              {renderIf(!disabled && choices.length > 1)(() => (
                <Button
                  style={styles.addButton}
                  bsStyle="link"
                  type="button"
                  onClick={() => this.onRemoveChoice(i)}
                >
                  -
                </Button>
              ))}
            </div>
          ))}
          {renderIf(!disabled)(() =>
            <Button
              style={[styles.button, styles.add]}
              bsStyle="link"
              type="button"
              onClick={this.onAddChoice}
            >
              Add a choice
            </Button>
          )}
          <p style={styles.instruction}>
            Number of correct answers {selectable}
          </p>

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
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 4,
  },
  button: {
    textDecoration: 'none',
    alignSelf: 'center',
  },
};

export default compose(MultiChoice);
