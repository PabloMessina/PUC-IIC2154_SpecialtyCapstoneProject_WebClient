import React, { PropTypes, Component } from 'react';
import {
  Button,
  FormGroup,
  FormControl,
} from 'react-bootstrap';
import renderIf from 'render-if';
import debounce from 'lodash/debounce';


import compose, { QuestionPropTypes } from './question';


class TShort extends Component {

  static get propTypes() {
    return { ...QuestionPropTypes, interval: PropTypes.number };
  }

  static get defaultProps() {
    return { answer: { options: [] }, interval: 700 };
  }

  constructor(props) {
    super(props);
    const answer = props.answer;
    this.state = {
      values: answer.options && answer.options.length ? answer.options : [''],
    };
    this.onTextChange = this.onTextChange.bind(this);
    this.onAddAnswer = this.onAddAnswer.bind(this);
    this.onRemoveAnswer = this.onRemoveAnswer.bind(this);

    if (this.props.onAnswerChange) {
      // Debouce this method call (only call it if has no change after the interval)
      this.onAnswerChange = debounce(this.props.onAnswerChange, props.interval);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ values: nextProps.answer.options || [] });
  }

  onAddAnswer() {
    const values = [...this.state.values, ''];
    this.setState({ values });
    if (this.onAnswerChange) this.onAnswerChange({ options: values });
  }

  onRemoveAnswer(event, index) {
    event.preventDefault();

    const values = [...this.state.values];
    values.splice(index, 1);
    this.setState({ values });
    if (this.onAnswerChange) this.onAnswerChange({ options: values });
  }

  onTextChange(event, index) {
    event.preventDefault();

    const values = [...this.state.values];
    values[index] = event.target.value;
    this.setState({ values });
    if (this.onAnswerChange) this.onAnswerChange({ options: values });
  }

  renderEditor() {
    const { disabled } = this.props;
    const { values } = this.state;

    return (
      <form style={styles.container} onSubmit={e => e.preventDefault()}>
        <FormGroup>
          {values.map((value, i) => (
            <FormGroup key={i} style={styles.row}>
              <FormControl
                type="text"
                placeholder={i > 0 ? 'Enter alternative answer' : 'Enter answer'}
                value={value}
                disabled={disabled}
                onChange={e => this.onTextChange(e, i)}
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
    const { disabled } = this.props;
    const { values } = this.state;

    return (
      <form style={styles.container} onSubmit={e => e.preventDefault()}>
        <FormControl
          style={styles.input}
          type="text"
          disabled={disabled}
          placeholder="Enter here your answer"
          value={values[0]}
          onChange={e => this.onTextChange(e, 0)}
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
