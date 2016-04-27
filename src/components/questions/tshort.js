import React, { Component } from 'react';
import {
  Form,
  Button,
  FormControl,
  ControlLabel,
  FormGroup,
} from 'react-bootstrap';

import renderIf from 'render-if';
import { Colors } from '../../styles';


export default class TShort extends Component {

  static get propTypes() {
    return {
      _id: React.PropTypes.number,
      question: React.PropTypes.any,
      tags: React.PropTypes.array,
      fields: React.PropTypes.any,
      changeQuestion: React.PropTypes.func,
      changeFields: React.PropTypes.func,
      permission: React.PropTypes.string,
    };
  }

  static get defaultProps() {
    return {
      _id: 0,
      question: { text: '' },
      tags: [],
      fields: {
        answers: [],
      },
      permission: 'reader',
    };
  }

  constructor(props) {
    super(props);
    this.renderEditor = this.renderEditor.bind(this);
    this.renderResponder = this.renderResponder.bind(this);
    this.renderReader = this.renderReader.bind(this);
    this.changeQuestion = this.changeQuestion.bind(this);
    this.changeFields = this.changeFields.bind(this);
    this.addAnswer = this.addAnswer.bind(this);
    this.removeAnswer = this.removeAnswer.bind(this);
  }

  changeQuestion(event) {
    this.props.changeQuestion(this.props._id, {
      text: event.target.value,
    });
  }

  changeFields(event, index) {
    const fields = this.props.fields;
    if (this.props.permission === 'editor') {
      fields.answers[index] = event.target.value;
      this.props.changeFields(this.props._id, fields);
    } else if (this.props.permission === 'reader') {
      this.props.changeFields(this.props._id, { answers: [event.target.value] });
    }
  }

  addAnswer() {
    const fields = this.props.fields;
    fields.answers.push('');
    this.props.changeFields(this.props._id, fields);
  }

  removeAnswer(event, index) {
    const fields = this.props.fields;
    fields.answers.splice(index, 1);
    this.props.changeFields(this.props._id, fields);
  }

  renderEditor() {
    return (
      <Form style={styles.form}>
        <FormGroup>
          <ControlLabel>Statement</ControlLabel>
          <FormControl
            style={styles.textArea}
            componentClass="textarea"
            placeholder="Add a statement"
            value={this.props.question.text}
            onChange={this.changeQuestion}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Choices </ControlLabel>
          {this.props.fields.answers.map((answer, i) => (
            <FormGroup key={i} style={styles.row}>
              <FormControl
                type="text"
                placeholder="Ingrese su respuesta"
                value={answer}
                onChange={e => this.changeFields(e, i)}
              />
              {renderIf(i > 0)(() => (
                <Button
                  bsStyle="link"
                  bsSize="large"
                  type="button"
                  onClick={e => this.removeAnswer(e, i)}
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
          onClick={this.addAnswer}
        >
          Agregar respuesta
        </Button>
      </Form>
    );
  }

  renderResponder() {
    return (
      <Form style={styles.form}>
        <FormGroup>
          <ControlLabel>{this.props.question.text}</ControlLabel>
          <FormControl
            style={styles.input}
            type="text"
            placeholder="Ingrese su respuesta"
            value={this.props.fields.answers[0]}
            onChange={e => this.changeFields(e)}
          />
        </FormGroup>
      </Form>
    );
  }

  renderReader() {
    return (
      <div>
        <p>{this.props.question.text}</p>
        <p style={styles.instruction}>Choices</p>
        <ul>
          {this.props.fields.answers.map((answer, index) => <li key={index} style={styles.input}>{answer}</li>)}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div>
      {(() => {
        switch (this.props.permission) {
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
};
