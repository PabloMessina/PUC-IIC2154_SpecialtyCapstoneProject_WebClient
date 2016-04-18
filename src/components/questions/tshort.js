import React, { Component } from 'react';
import { Panel, Input, ButtonInput } from 'react-bootstrap';
import Title from './title.js';
import renderIf from 'render-if';

export default class TShort extends Component {

  // editor: can change statement and choices
  // responder: only can introduce an answer
  // reader: only reader
  static get propTypes() {
    return {
      question: React.PropTypes.any,
      answers: React.PropTypes.array,
      statement: React.PropTypes.string,
      responderAnswer: React.PropTypes.string,
      permission: React.PropTypes.string,
    };
  }

  static get defaultProps() {
    return {
      question: {},
      answers: [''],
      responderAnswer: '',
      statement: '',
      permission: 'reader',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      statement: this.props.question.question.text === undefined ?
        this.props.statement : this.props.question.question.text,
      answers: (this.props.answers && this.props.question.fields.answers) ?
        this.props.question.fields.answers : this.props.answers,
      responderAnswer: this.props.responderAnswer,
      permission: this.props.permission,
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
      answers[index] = e.target.value;
      this.setState({ answers });
    } else if (option === 'responder') {
      this.setState({ responderAnswer: e.target.value });
    }
  }

  addItem(e) {
    e.preventDefault();
    const answers = this.state.answers;
    const last = answers[answers.length - 1];
    if (last && last.length > 0) {
      this.setState({ answers: [...answers, ''] });
    }
  }

  removeItem(e, index) {
    e.preventDefault();
    const answers = [...this.state.answers];
    answers[index] = '';
    if (answers.length > 1) {
      answers.splice(index, 1);
    }
    this.setState({ answers });
  }

  renderQuestion(permission) {
    const { question } = this.props.question;
    if (permission === 'editor') {
      return (
        <form style={styles.form}>
        <p>Statement</p>
          <Input
            style={styles.textArea}
            type="textArea"
            placeholder="Add a statement"
            value={this.state.statement}
            onChange={e => this.onChange(e, 'statement')}
          />
          <p>Choices</p>
          {this.state.answers.map((answer, i, arr) => (
            <div style={styles.row}>
              <Input
                key={i}
                style={styles.input}
                type="text"
                placeholder="Ingrese su respuesta"
                value={answer}
                autoFocus={arr.length - 1 === i}
                onChange={e => this.onChange(e, 'option', i)}
              />
              {renderIf(i > 0)(() => (
                <ButtonInput
                  style={[styles.button, styles.remove]}
                  bsStyle="link"
                  bsSize="large"
                  onClick={e => this.removeItem(e, 'option', i)}
                >
                  -
                </ButtonInput>
              ))}
            </div>
          ))}
          <ButtonInput
            style={[styles.button, styles.add]}
            bsStyle="link"
            type="submit"
            value="Agregar respuesta"
            onClick={this.addItem}
          />
      </form>
      );
    } else if (permission === 'responder') {
      return (
        <form style={styles.form}>
          <p>{question.text}</p>
          <div style={styles.row}>
            <Input
              style={styles.input}
              type="text"
              placeholder="Ingrese su respuesta"
              value={this.state.responderAnswer}
              onChange={e => this.onChange(e, permission)}
            />
          </div>
        </form>);
    }
    return (
      <div>
        <p>{question.text}</p>
        <p>Choices</p>
        <ul>
          {this.state.answers.map((answer, index) => <li key={index}>{answer}</li>)}
        </ul>
      </div>
    );
  }

  render() {
    const { _id, tags } = this.props.question;
    return (
        <Panel style={styles.container} header={<Title value={`Question ${_id}`} tags={tags} />}>
          <div>
            {this.renderQuestion(this.state.permission)}
          </div>
        </Panel>
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
    alignItems: 'stretch',
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
};
