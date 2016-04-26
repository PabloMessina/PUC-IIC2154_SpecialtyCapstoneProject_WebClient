import React, { Component } from 'react';
import {
  Button,
  Form,
  ControlLabel,
  FormControl,
  FormGroup,
  Checkbox,
} from 'react-bootstrap';
import renderIf from 'render-if';

import { Colors } from '../../styles';
// Choices: array of objects {text:''}.
// Answers: array of booleans.

export default class MultiChoice extends Component {

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
        selectable: 1,
        choices: [{ text: 'Option 1' }, { text: 'Option 2' }],
        answers: [1],
      },
      permission: 'reader',
    };
  }

  constructor(props) {
    debugger;
    super(props);
    this.renderEditor = this.renderEditor.bind(this);
    this.renderResponder = this.renderResponder.bind(this);
    // this.renderReader = this.renderReader.bind(this);
    this.changeQuestion = this.changeQuestion.bind(this);
    this.changeFields = this.changeFields.bind(this);
    this.check = this.check.bind(this);
    this.addChoice = this.addChoice.bind(this);
    this.removeChoice = this.removeChoice.bind(this);
  }

  check(index) {
    const answers = this.props.fields.answers;
    if (answers.includes(index)) {
      answers.splice(answers.findIndex((item) => item === index), 1);
    } else {
      answers.push(index);
    }
    this.props.changeFields(this.props._id, {
      selectable: answers.length,
      choices: this.props.fields.choices,
      answers: this.props.fields.answers,
    });
  }

  changeQuestion(event) {
    this.props.changeQuestion(this.props._id, {
      text: event.target.value,
    });
  }

  changeFields(event, index) {
    const fields = this.props.fields;
    fields.choices[index].text = event.target.value;
    this.props.changeFields(this.props._id, fields);
  }

  addChoice() {
    const fields = this.props.fields;
    fields.choices.push({ text: '' });
    this.props.changeFields(this.props._id, fields);
  }

  removeChoice(event, index) {
    const fields = this.props.fields;
    fields.choices.splice(index, 1);
    this.props.changeFields(this.props._id, fields);
  }

  // onChange(event, _type, index) {
  //   if (_type === 'statement') {
  //     this.setState({ statement: event.target.value });
  //   } else if (_type === 'choice') {
  //     const choices = [...this.state.choices];
  //     choices[index].text = event.target.value;
  //     this.setState({ choices });
  //   }
  //   this.props.returnValue({
  //     question: { text: this.state.statement },
  //     fields: {
  //       selectable: this.state.selectable,
  //       choices: this.state.choices,
  //       answers: this.state.answers,
  //     },
  //   });
  // }
  //
  // addItem(e) {
  //   e.preventDefault();
  //   const answers = this.state.answers;
  //   const choices = this.state.choices;
  //   if (choices.filter((choice) => choice.text === '').length < 1) {
  //     this.setState({ answers: [...answers, false] });
  //     this.setState({ choices: [...choices, { text: '' }] });
  //   }
  //   this.props.returnValue({
  //     question: { text: this.state.statement },
  //     fields: {
  //       selectable: this.state.selectable,
  //       choices: this.state.choices,
  //       answers: this.state.answers,
  //     },
  //   });
  // }
  //
  // removeItem(e, index) {
  //   e.preventDefault();
  //   const answers = [...this.state.answers];
  //   const choices = [...this.state.choices];
  //   if (answers.length > 1) {
  //     answers.splice(index, 1);
  //     choices.splice(index, 1);
  //   }
  //   this.setState({ answers });
  //   this.setState({ choices });
  //   this.props.returnValue({
  //     question: { text: this.state.statement },
  //     fields: {
  //       selectable: this.state.selectable,
  //       choices: this.state.choices,
  //       answers: this.state.answers,
  //     },
  //   });
  // }

  renderEditor() {
    return (
      <Form style={styles.form}>
        <FormGroup>
          <ControlLabel>Statement</ControlLabel>
          <FormControl
            style={styles.textArea}
            type="textArea"
            placeholder="Add a statement"
            value={this.props.question.text}
            onChange={e => this.changeQuestion(e)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Choices: you must select
            {` ${this.props.fields.selectable} `}
            option
            {this.props.fields.selectable > 1 ? 's.' : '.' }
          </ControlLabel>
          <div style={styles.body}>
            <div style={styles.column}>
              {this.props.fields.choices.map((choice, i) => (
                <div key={i} style={styles.choice}>
                  <Checkbox
                    checked={this.props.fields.answers.includes(i)}
                    onChange={() => this.check(i)}
                  />
                  <FormControl
                    type="text"
                    value={choice.text}
                    placeholder={""}
                    onChange={(e) => this.changeFields(e, i)}
                  />
                  {renderIf(i > 0)(() => (
                    <Button
                      style={styles.button}
                      bsStyle="link"
                      bsSize="large"
                      type="button"
                      onClick={e => this.removeChoice(e, i)}
                    >
                      -
                    </Button>
                  ))}
                </div>
              ))}
              <Button
                style={[styles.button, styles.add]}
                bsStyle="link"
                type="button"
                onClick={this.addChoice}
              >Add a choice</Button>
            </div>
          </div>
        </FormGroup>
      </Form>
    );
  }

  renderResponder() {
    return (
      <Form style={styles.form}>
        <FormGroup>
          <ControlLabel>{this.props.question.text}</ControlLabel>
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Choices: you must select
            {` ${this.props.fields.selectable} `}
            option
            {this.props.fields.selectable > 1 ? 's.' : '.' }
          </ControlLabel>
          <div style={styles.body}>
            <div style={styles.column}>
              {this.props.fields.choices.map((choice, i) => (
                <Checkbox
                  key={i}
                  checked={this.props.fields.answers.includes(i)}
                  onChange={() => this.check(i)}
                >
                  {choice.text}
                </Checkbox>
              ))}
            </div>
          </div>
        </FormGroup>
      </Form>
      );
  }

  renderReader() {
    return (
      <div>
        <p>{this.props.question.text}</p>
        <p style={styles.instruction}>
          Choices: you must select
          {` ${this.props.fields.selectable} `}
          option
          {this.props.fields.selectable > 1 ? 's.' : '.' }
        </p>
        <div style={styles.body}>
          <div style={styles.column}>
              {this.props.fields.choices.map((choice, i) => (
                <Checkbox
                  key={i}
                  checked={this.props.fields.answers.includes(i)}
                  disabled
                >
                  {choice.text}
                </Checkbox>
              ))}
          </div>
        </div>
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
  body: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  choice: {
    display: 'flex',
    flexDirection: 'row',
  },
  button: {
    textDecoration: 'none',
    alignSelf: 'center',
  },
  instruction: {
    fontSize: 14,
    color: Colors.GRAY,
  },
  checkbox: {

  },
};
