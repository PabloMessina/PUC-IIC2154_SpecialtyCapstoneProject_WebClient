import React, { Component } from 'react';
import { Panel, Input, ButtonInput } from 'react-bootstrap';
import Title from './title.js';

export default class MultiChoice extends Component {

  static get propTypes() {
    return {
      question: React.PropTypes.any,
      choices: React.PropTypes.array,
      answers: React.PropTypes.array,
      selectable: React.PropTypes.number,
      statement: React.PropTypes.string,
      permission: React.PropTypes.string,
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
    };

    this.onChange = this.onChange.bind(this);
    this.check = this.check.bind(this);
  }

  onChange(event) {
    this.setState({ statement: event.target.value });
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
            onChange={e => this.onChange(e)}
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
          {/* <ButtonInput
            style={[styles.button, styles.add]}
            bsStyle="link"
            type="submit"
            value="Add choice"
            onClick={this.addItem}
          />*/}
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
      <p>
        Choices: you must select
        {` ${this.state.selectable} `}
        option
        {this.state.selectable > 1 ? 's.' : '.' }
      </p>
      <div style={styles.body}>
        <div style={styles.column}>
          <form>
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
          </form>
        </div>
      </div>
    </form>
    );
  }

  render() {
    const { _id, tags } = this.props.question;
    return (
        <Panel style={styles.container} header={<Title value={`Question ${_id}`} tags={tags} />}>
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
};
