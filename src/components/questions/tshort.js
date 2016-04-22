import React, { Component } from 'react';
import { Input, ButtonInput } from 'react-bootstrap';
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
    };
  }

  static get defaultProps() {
    return {
      _id: 0,
      question: { question: { text: '' }, fields: { answers: [] } },
      answers: [''],
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
    if (answers.length > 1) {
      answers.splice(index, 1);
    }
    this.setState({ answers });
  }

  renderEditor() {
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
        <p style={styles.instruction}>Choices</p>
        {this.state.answers.map((answer, i, arr) => (
          <div key={i} style={styles.row}>
            <Input
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
                type="button"
                onClick={e => this.removeItem(e, i)}
              >
                -
              </ButtonInput>
            ))}
          </div>
        ))}
        <ButtonInput
          style={[styles.button, styles.add]}
          bsStyle="link"
          type="button"
          value="Agregar respuesta"
          onClick={this.addItem}
        />
      </form>
    );
  }

  renderResponder() {
    debugger;
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
