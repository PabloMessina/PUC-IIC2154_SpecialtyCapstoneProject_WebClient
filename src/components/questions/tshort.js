import React, { Component } from 'react';
import {
  Button,
  ControlLabel,
  FormGroup,
  FormControl,
} from 'react-bootstrap';
import renderIf from 'render-if';


import compose, { QuestionPropTypes } from './question';


class TShort extends Component {

  static get propTypes() {
    return QuestionPropTypes;
  }

  static get defaultProps() {
    return { answer: { options: [] } };
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.onTextChange = this.onTextChange.bind(this);
    this.onAddAnswer = this.onAddAnswer.bind(this);
    this.onRemoveAnswer = this.onRemoveAnswer.bind(this);
  }

  onAddAnswer() {
    const { answer } = this.props;
    const options = answer.options && answer.options.length ? answer.options : [''];
    this.props.onAnswerChange({ options: [...options, ''] });
  }

  onRemoveAnswer(event, index) {
    event.preventDefault();

    const { answer } = this.props;
    const options = answer.options && answer.options.length ? answer.options : [''];
    options.splice(index, 1);
    this.props.onAnswerChange({ options });
  }

  onTextChange(value, index) {
    const { answer } = this.props;
    const options = answer.options && answer.options.length ? answer.options : [''];
    options[index] = value;
    this.props.onAnswerChange({ options });
  }

  renderEditor() {
    const { answer, disabled } = this.props;
    const options = answer.options && answer.options.length ? answer.options : [''];

    return (
      <form style={styles.container}>
        <FormGroup>
          {options.map((option, i) => (
            <FormGroup key={i} style={styles.row}>
              <FormControl
                type="text"
                placeholder={i > 0 ? 'Enter alternative answer' : 'Enter answer'}
                value={option}
                disabled={disabled}
                onChange={e => this.onTextChange(e.target.value, i)}
              />
              {renderIf(!disabled && i > 0)(() => (
                <Button
                  style={styles.addButton}
                  bsStyle="link"
                  type="button"
                  onClick={e => this.onRemoveAnswer(e, i)}
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
          onClick={this.onAddAnswer}
        >
          Add another posible answer
        </Button>
      </form>
    );
  }


  renderResponder() {
    const { answer, disabled } = this.props;
    const options = answer.options;

    return (
      <form style={styles.container}>
        <FormControl
          style={styles.input}
          type="text"
          disabled={disabled}
          placeholder="Your answer"
          value={options[0]}
          onChange={e => this.onTextChange(e.target.value, 0)}
        />
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
