import React, { Component } from 'react';
import {
  Input,
  ButtonInput,
  Form,
  ControlLabel,
  FormControl,
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
      choices: React.PropTypes.array,
      answers: React.PropTypes.array,
      selectable: React.PropTypes.number,
      statement: React.PropTypes.string,
      permission: React.PropTypes.string,
      collapsible: React.PropTypes.bool,
      open: React.PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      _id: 0,
      question: { question: { text: '' }, fields: { answers: [], choices: [{ text: '' }] } },
      choices: [{ text: '' }],
      answers: [false],
      statement: '',
      permission: 'reader',
      selectable: 1,
      collapsible: true,
      open: false,
    };
  }

  constructor(props) {
    super(props);
    const answers = Array(this.props.question.fields.choices.length).fill(false);
    if (props.question.fields.answers.length) {
      props.question.fields.answers.forEach(index => {
        answers[index] = true;
      });
    }
    this.state = {
      _id: props.question._id || props._id,
      question: props.question,
      choices: props.question.fields.choices.length
        && props.question.fields.choices[0].text
        ? props.question.fields.choices
        : props.choices,
      answers: answers.length ? answers : props.answers,
      statement: props.question.question.text || props.statement,
      selectable: props.question.fields.selectable || props.selectable,
      permission: props.permission,
      collapsible: props.collapsible,
      open: props.open,
    };
    this.onChange = this.onChange.bind(this);
    this.check = this.check.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.addItem = this.addItem.bind(this);
  }

  onChange(event, _type, index) {
    if (_type === 'statement') {
      this.setState({ statement: event.target.value });
    } else if (_type === 'choice') {
      const choices = [...this.state.choices];
      choices[index].text = event.target.value;
      this.setState({ choices });
    }
  }

  addItem(e) {
    e.preventDefault();
    const answers = this.state.answers;
    const choices = this.state.choices;
    if (choices.filter((choice) => choice.text === '').length < 1) {
      this.setState({ answers: [...answers, false] });
      this.setState({ choices: [...choices, { text: '' }] });
    }
  }

  removeItem(e, index) {
    e.preventDefault();
    const answers = [...this.state.answers];
    const choices = [...this.state.choices];
    if (answers.length > 1) {
      answers.splice(index, 1);
      choices.splice(index, 1);
    }
    this.setState({ answers });
    this.setState({ choices });
  }

  check(index) {
    const answers = [...this.state.answers];
    answers[index] = !answers[index];
    this.setState({ answers });
  }

  renderEditor() {
    return (
      <Form style={styles.form}>
        <ControlLabel>Statement</ControlLabel>
        <FormControl
          style={styles.textArea}
          type="textArea"
          placeholder="Add a statement"
          value={this.state.statement}
          onChange={e => this.onChange(e, 'statement')}
        />
        <p>
          Choices: you must select
          {` ${this.state.selectable} `}
          option
          {this.state.selectable > 1 ? 's.' : '.' }
        </p>
        <div style={styles.body}>
          <div style={styles.column}>
            {this.state.choices.map((choice, i) => (
              <div key={i} style={styles.choice}>
                <Input
                  type="checkbox"
                  label=" "
                  checked={this.state.answers[i]}
                  onChange={() => this.check(i)}
                />
                <Input
                  type="text"
                  value={choice.text}
                  checked={this.state.answers[i]}
                  placeholder={"placeholder"}
                  onChange={(e) => this.onChange(e, 'choice', i)}
                />
                {renderIf(i > 0)(() => (
                  <ButtonInput
                    style={styles.button}
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
              value="Add a choice"
              onClick={this.addItem}
            />
          </div>
        </div>
      </Form>
    );
  }

  renderResponder() {
    return (
      <form style={styles.form}>
        <p>{this.state.statement}</p>
        <p>
          Choices: you must select
          {` ${this.state.selectable} `}
          option
          {this.state.selectable > 1 ? 's.' : '.' }
        </p>
        <div style={styles.body}>
          <div style={styles.column}>
            {this.state.choices.map((choice, i) => (
              <Input
                key={i}
                type="checkbox"
                label={choice.text}
                checked={this.state.answers[i]}
                onChange={() => this.check(i)}
              />
            ))}
          </div>
        </div>
      </form>
      );
  }

  renderReader() {
    return (
      <form style={styles.form}>
      <p>{this.state.statement}</p>
      <p style={styles.instruction}>
        Choices: you must select
        {` ${this.state.selectable} `}
        option
        {this.state.selectable > 1 ? 's.' : '.' }
      </p>
      <div style={styles.body}>
        <div style={styles.column}>
            {this.state.choices.map((choice, i) => (
              <Input
                key={i}
                type="checkbox"
                label={choice.text}
                checked={this.state.answers[i]}
                onChange={() => this.check(i)}
                disabled
              />
            ))}
        </div>
      </div>
    </form>
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
};
