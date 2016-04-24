import React, { Component } from 'react';
import {
  Input,
  Button,
  FormControl,
  ControlLabel,
  FormGroup,
} from 'react-bootstrap';
import renderIf from 'render-if';

import { Colors } from '../../styles';

export default class TShort extends Component {

  // editor: can change statement and choices
  // responder: only can introduce an answer
  // reader: only reader
  static get propTypes() {
    return {
      _id: React.PropTypes.number,
      question: React.PropTypes.any,
      answers: React.PropTypes.array,
      statement: React.PropTypes.string,
      responderAnswer: React.PropTypes.string,
      permission: React.PropTypes.string,
      collapsible: React.PropTypes.bool,
      open: React.PropTypes.bool,
      validateAnswers: React.PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      _id: 0,
      question: { question: { text: '' }, fields: { answers: [] } },
      answers: [''],
      validateAnswers: [''],
      responderAnswer: '',
      statement: '',
      permission: 'reader',
      collapsible: true,
      open: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      _id: props.question._id || props._id,
      question: props.question,
      statement: props.question.question.text || props.statement,
      answers: props.question.fields.answers.length
        ? props.question.fields.answers
        : props.answers,
      validateAnswers: props.question.fields.answers.length
        ? Array(props.question.fields.answers.length).fill('')
        : props.validateAnswers,
      responderAnswer: props.responderAnswer,
      permission: props.permission,
      collapsible: props.collapsible,
      open: props.open,
    };

    this.onChange = this.onChange.bind(this);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  onChange(e, option, index) {
    // const answers = this.state.answers.splice(index, 1, e.target.value);
    if (option === 'statement') {
      this.setState({ statement: e.target.value });
    } else if (option === 'option') {
      const answers = [...this.state.answers];
      const validateAnswers = [...this.state.validateAnswers];
      answers[index] = e.target.value;
      validateAnswers[index] = answers[index].length > 0 ? '  ' : 'error';
      this.setState({ answers, validateAnswers });
    } else if (option === 'responder') {
      this.setState({ responderAnswer: e.target.value });
    }
  }

  addItem(e) {
    e.preventDefault();
    const answers = this.state.answers;
    const validateAnswers = this.state.validateAnswers;
    // const last = answers[answers.length - 1];
    // if (last && last.length > 0) {
    this.setState({
      answers: [...answers, ''],
      validateAnswers: [...validateAnswers, ''],
    });
    // }
  }

  removeItem(e, index) {
    e.preventDefault();
    const answers = [...this.state.answers];
    const validateAnswers = [...this.state.validateAnswers];
    if (answers.length > 1) {
      answers.splice(index, 1);
      validateAnswers.splice(index, 1);
    }
    this.setState({ answers, validateAnswers });
  }

  renderEditor() {
    return (
      <form style={styles.form}>
        <FormGroup>
          <ControlLabel>Statement</ControlLabel>
          <FormControl
            style={styles.textArea}
            componentClass="textarea"
            placeholder="Add a statement"
            value={this.state.statement}
            onChange={e => this.onChange(e, 'statement')}
          />
        </FormGroup>
        <FormGroup>
        {(() => {
          if (this.state.validateAnswers.filter((item) =>
          item === 'error').length > 0) {
            return (
              <ControlLabel style={styles.instruction}>
                Choices must not be empty
              </ControlLabel>
            );
          }
          return (<ControlLabel style={styles.instruction}>Choices </ControlLabel>);
        })()}
          {this.state.answers.map((answer, i, arr) => (
            <FormGroup key={i} style={styles.row} validationState={this.state.validateAnswers[i]}>
              <FormControl
                style={styles.input}
                type="text"
                placeholder="Ingrese su respuesta"
                value={answer}
                autoFocus={arr.length - 1 === i}
                onChange={e => this.onChange(e, 'option', i)}
              />
              {renderIf(i > 0)(() => (
                <Button
                  style={[styles.button, styles.remove]}
                  bsStyle="link"
                  bsSize="large"
                  type="button"
                  onClick={e => this.removeItem(e, i)}
                >
                  -
                </Button>
              ))}
            </FormGroup>
          ))}
        </FormGroup>
        <Button
          style={[styles.button, styles.add]}
          bsStyle="link"
          type="button"
          value="Agregar respuesta"
          onClick={this.addItem}
        >
          Agregar respuesta
        </Button>
      </form>
    );
  }

  renderResponder() {
    return (
      <form style={styles.form}>
        <p>{this.state.statement}</p>
        <div style={styles.row}>
          <Input
            style={styles.input}
            type="text"
            placeholder="Ingrese su respuesta"
            value={this.state.responderAnswer}
            onChange={e => this.onChange(e, 'responder')}
          />
        </div>
      </form>
    );
  }

  renderReader() {
    return (
      <div>
        <p>{this.state.statement}</p>
        <p style={styles.instruction}>Choices</p>
        <ul>
          {this.state.answers.map((answer, index) => <li key={index}>{answer}</li>)}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div>
        {(() => {
          switch (this.state.permission) {
            case 'editor': return (this.renderEditor());
            case 'responder': return (this.renderResponder());
            case 'reader': return (this.renderReader());
            default: return null;
          }})()}
      </div>
    );
  }
}

const styles = {
  container: {
  },
  title: {
    fontSize: 18,
    margin: 0,
  },
  form: {
    margin: 0,
  },
  tag: {
    marginLeft: 3,
    marginRight: 3,
  },
  header: {
    padding: -5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  input: {
    alignSelf: 'center',

  },
  textArea: {
    alignSelf: 'center',
    margin: 0,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  button: {
    textDecoration: 'none',
  },
  add: {

  },
  remove: {

  },
  instruction: {
    fontSize: 14,
    color: Colors.GRAY,
  },
};
