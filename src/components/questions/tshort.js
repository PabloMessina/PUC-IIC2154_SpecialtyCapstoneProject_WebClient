import React from 'react';
import {
  Button,
  FormGroup,
  FormControl,
} from 'react-bootstrap';
import renderIf from 'render-if';

import compose, { QuestionPropTypes } from './question';


const TShort = ({ mode, answer, onAnswerChange, ...props }) => {
  // Skip problems with nulls
  const options = (answer.options || []).map(o => o || '');

  const subcomp = {
    options,
    onAddAnswer: () => onAnswerChange({ options: [...options, ''] }),
    onTextChange: (e, index) => {
      e.preventDefault();
      const changed = [...options];
      changed[index] = e.target.value;
      onAnswerChange({ options: changed });
    },
    onRemoveAnswer: (e, index) => {
      e.preventDefault();
      const changed = [...options];
      changed.splice(index, 1);
      onAnswerChange({ options: changed });
    },
  };

  switch (mode) {
    case 'editor': return <Editor {...subcomp} {...props} />;
    case 'responder': return <Responder {...subcomp} {...props} />;
    case 'reader': return <Responder {...subcomp} {...props} />;
    default: return null;
  }
};

const Editor = ({ options, disabled, onAddAnswer, onRemoveAnswer, onTextChange, ...props }) => (
  <form style={styles.container} onSubmit={e => e.preventDefault()} {...props}>
    <FormGroup>
      {options.map((value, i) => (
        <FormGroup key={i} style={styles.row}>
          <FormControl
            type="text"
            placeholder={i > 0 ? 'Enter alternative answer' : 'Enter answer'}
            value={value}
            disabled={disabled}
            onChange={e => onTextChange(e, i)}
          />
          {renderIf(!disabled && i > 0)(() => (
            <Button
              style={styles.addButton}
              bsStyle="link"
              type="button"
              onClick={e => onRemoveAnswer(e, i)}
            >
              -
            </Button>
          ))}
        </FormGroup>
      ))}
    </FormGroup>
    <Button
      style={styles.addButton}
      bsStyle="link"
      type="button"
      disabled={disabled}
      onClick={onAddAnswer}
    >
      Add another posible answer
    </Button>
  </form>
);

const Responder = ({ options, disabled, onTextChange, ...props }) => (
  <form style={styles.container} onSubmit={e => e.preventDefault()} {...props}>
    <FormControl
      style={styles.input}
      type="text"
      disabled={disabled}
      placeholder="Enter here your answer"
      value={options[0]}
      onChange={e => onTextChange(e, 0)}
    />
  </form>
);

TShort.propTypes = QuestionPropTypes;
TShort.defaultProps = { answer: { options: [] } };
TShort.isAnswered = (answer) => answer && answer.options && answer.options.length && answer.options[0].length;
Editor.propTypes = QuestionPropTypes;
Responder.propTypes = QuestionPropTypes;

const styles = {
  container: {
    marginTop: 15,
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
  },
};

export default compose(TShort);
