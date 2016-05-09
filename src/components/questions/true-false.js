import React, { Component } from 'react';
import {
  Button,
  FormGroup,
} from 'react-bootstrap';

import { Colors } from '../../styles';
import compose, { QuestionPropTypes } from './question';


class TrueFalse extends Component {

  static get propTypes() {
    return QuestionPropTypes;
  }

  static get defaultProps() {
    return { answer: { value: 0 } };
  }

  render() {
    const { answer, disabled, onAnswerChange } = this.props;
    const value = answer.value;

    const left = {
      disabled,
      style: value === 1 ? { ...styles.button, ...styles.buttonTrue } : styles.button,
      onClick: () => onAnswerChange({ value: value === 1 ? 0 : 1 }),
    };

    const right = {
      disabled,
      style: value === -1 ? { ...styles.button, ...styles.buttonFalse } : styles.button,
      onClick: () => onAnswerChange({ value: value === -1 ? 0 : -1 }),
    };

    return (
      <form style={styles.container}>
        <FormGroup style={styles.buttons}>
          <Button {...left}>True</Button>
          <div style={{ width: 20 }} />
          <Button {...right}>False</Button>
        </FormGroup>
      </form>
    );
  }
}

const styles = {
  container: {
    marginTop: 15,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    // backgroundColor: Colors.GRAY,
    display: 'flex',
    flex: 1,
  },
  buttonTrue: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
  },
  buttonFalse: {
    backgroundColor: Colors.RED,
    color: Colors.WHITE,
  },
};

export default compose(TrueFalse);
