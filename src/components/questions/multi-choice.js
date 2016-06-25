import React from 'react';
import {
  Checkbox,
  Button,
  FormControl,
} from 'react-bootstrap';
import renderIf from 'render-if';

import { Colors } from '../../styles';
import compose, { QuestionPropTypes } from './question';


const MultiChoice = ({ mode, fields, answer, onFieldsChange, onAnswerChange, ...props }) => {
  // Answer choices
  const choices = answer.choices || [];
  // Field choices
  const fchoices = fields.choices && fields.choices.length ? [...fields.choices] : [''];

  const subcomp = {
    choices, // answer choices
    fields, // has fields choices
    onTextChange: (e, index) => {
      // Update value of changed
      fchoices[index] = { text: e.target.value };
      // Call event
      onFieldsChange({ choices: fchoices });
    },
    onRemoveChoice: (index) => {
      // Remove field
      fchoices.splice(index, 1);

      // Keep in sync with current answers
      const achoices = choices.filter(c => c !== index).map(c => (c > index ? c - 1 : c));

      onAnswerChange({ choices: achoices });
      onFieldsChange({ choices: fchoices });
    },
    onAddChoice: () => {
      onFieldsChange({ choices: [...fchoices, ''] });
    },
    onCheck: (i, selectable = Infinity) => {
      const changed = [...choices];
      const index = changed.indexOf(i);

      if (index >= 0) {
        // Remove if present
        changed.splice(index, 1);
      } else {
        // Add to answer
        changed.push(i);
        const selected = changed.length;

        // Remove early selected till match max selection size and left one space for the current value
        if (selected > selectable) Array(selected - selectable).fill(0).forEach(() => changed.shift());
      }
      onAnswerChange({ choices: changed });
    },
  };
  switch (mode) {
    case 'editor': return <Editor choices={fchoices} {...subcomp} {...props} />;
    case 'responder':
    case 'reader': return <Responder choices={choices} {...subcomp} {...props} />;
    default: return null;
  }
};

const Editor = ({ choices, fields, disabled, onTextChange, onRemoveChoice, onAddChoice, onCheck, ...props }) => {
  const selectable = choices.length || 0;
  return (
    <form style={styles.container} {...props}>
      <div style={styles.column}>
        {fields.choices.map((choice, i) => (
          <div key={i} style={styles.row}>
            <Button
              style={styles.addButton}
              bsStyle="link"
              type="button"
              onClick={() => onRemoveChoice(i)}
              >
              -
            </Button>
            <Checkbox
              checked={choices.includes(i)}
              disabled={disabled}
              onChange={() => onCheck(i)}
            />
            <FormControl
              type="text"
              value={choice.text}
              placeholder="Enter option"
              onChange={e => onTextChange(e, i)}
              disabled={disabled}
            />
          </div>
        ))}
        {renderIf(!disabled)(() =>
          <Button
            bsStyle="default"
            type="button"
            onClick={onAddChoice}
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
};

const Responder = ({ fields, choices, disabled, onCheck, ...props }) => (
  <div style={styles.container} {...props}>
    <div style={styles.column}>
      {fields.choices.map((choice, i) => (
        <Checkbox
          key={i}
          disabled={disabled}
          checked={choices.includes(i)}
          onChange={() => onCheck(i, fields.selectable)}
        >
          {choice.text}
        </Checkbox>
      ))}
      <p style={styles.instruction}>
        Select {fields.selectable} option{fields.selectable > 1 ? 's' : ''}
      </p>
    </div>
  </div>
);

MultiChoice.propTypes = QuestionPropTypes;
MultiChoice.defaultProps = { answer: { choices: [] }, fields: { choices: [''] } };
MultiChoice.isAnswered = (answer) => answer && answer.choices && answer.choices.length;
Responder.propTypes = QuestionPropTypes;
Editor.propTypes = QuestionPropTypes;

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
