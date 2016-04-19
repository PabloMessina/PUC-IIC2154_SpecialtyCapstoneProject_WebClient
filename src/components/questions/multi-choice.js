import React, { Component } from 'react';
import { Panel, Input, ButtonInput } from 'react-bootstrap';
import Title from './title.js';
import renderIf from 'render-if';

import { Colors } from '../../styles';
// Choices: array of objects {text:''}.
// Answers: array of booleans.

export default class MultiChoice extends Component {

  static get propTypes() {
    return {
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
      question: {},
      choices: [],
      answers: [],
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
    if (props.question.fields && props.question.fields.answers) {
      props.question.fields.answers.forEach(index => {
        answers[index] = true;
      });
    }
    this.state = {
      question: this.props.question,
      choices: this.props.question.fields.choices === undefined
        ? this.props.choices
        : this.props.question.fields.choices,
      answers,
      statement: this.props.question.question.text === undefined
        ? this.props.statement
        : this.props.question.question.text,
      selectable: this.props.question.fields.selectable === undefined
        ? this.props.selectable
        : this.props.question.fields.selectable,
      permission: this.props.permission,
      collapsible: this.props.collapsible,
      open: this.props.open,
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
    debugger;
    const answers = this.state.answers;
    const choices = this.state.choices;
    const last = choices[choices.length - 1].text;
    if (last && last.length > 0) {
      this.setState({ answers: [...answers, ''] });
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

  renderQuestion(permission) {
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
          <p>
            Choices: you must select
            {` ${this.state.selectable} `}
            option
            {this.state.selectable > 1 ? 's.' : '.' }
          </p>
          <div style={styles.body}>
            <div style={styles.column}>
              {this.state.choices.map((choice, i) => (
                <div style={styles.choice}>
                  <Input
                    key={`choiceCheckbox${i}`}
                    type="checkbox"
                    label=" "
                    checked={this.state.answers[i]}
                    onChange={() => this.check(i)}
                  />
                  <Input
                    key={`choiceText${i}`}
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
        </form>
      );
    } else if (permission === 'responder') {
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
    const { _id, tags } = this.props.question;
    return (
      <Panel
        style={styles.container}
        header={
          <Title
            value={`Question ${_id}`}
            tags={tags}
            onClick={() => this.setState({ open: !this.state.open })}
          />
        }
        collapsible={this.props.collapsible}
        expanded={this.state.open}
      >
        {this.renderQuestion(this.state.permission)}
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
