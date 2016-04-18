import React, { Component } from 'react';
import { Panel, Input, Button } from 'react-bootstrap';
import Title from './title.js';

import { Colors } from '../../styles';

export default class TrueFalse extends Component {

  static get propTypes() {
    return {
      question: React.PropTypes.object,
      statement: React.PropTypes.string,
      answer: React.PropTypes.number,
      permission: React.PropTypes.string,
    };
  }

  static get defaultProps() {
    return {
      question: {},
      statement: '',
      answer: 0,
      permission: 'reader',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      statement: this.props.question.question.text === undefined ?
      this.props.statement : this.props.question.question.text,
      answer: this.props.question.fields.answer ?
        this.props.question.fields.answer : this.props.answer,
      permission: this.props.permission,
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick(value) {
    if (this.state.answer === value) {
      this.setState({ answer: 0 });
    } else {
      this.setState({ answer: value });
    }
  }

  onChange(event) {
    this.setState({ statement: event.target.value });
  }

  renderQuestion(permission) {
    const { question } = this.props.question;
    if (permission === 'editor') {
      return (
        <div>
          <form style={styles.form}>
          <p>Statement</p>
            <Input
              style={styles.textArea}
              type="textArea"
              placeholder="Add a statement"
              value={this.state.statement}
              onChange={e => this.onChange(e, 'statement')}
            />
        </form>
        <div style={styles.buttons}>
          <Button
            bsStyle="default"
            style={this.state.answer === 1 ? styles.buttonTrue : styles.button}
            onClick={() => this.onClick(1)}
          >
            True
          </Button>
          <Button
            bsStyle="default"
            style={this.state.answer === -1 ? styles.buttonFalse : styles.button}
            onClick={() => this.onClick(-1)}
          >
            False
          </Button>
        </div>
      </div>
      );
    } else if (permission === 'responder') {
      return (
        <div>
          <p>{question.text}</p>
          <div style={styles.buttons}>
            <Button
              bsStyle="default"
              style={this.state.answer === 1 ? styles.buttonTrue : styles.button}
              onClick={() => this.onClick(1)}
            >
              True
            </Button>
            <Button
              bsStyle="default"
              style={this.state.answer === -1 ? styles.buttonFalse : styles.button}
              onClick={() => this.onClick(-1)}
            >
              False
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div>
        <p>{question.text}</p>
        <div style={styles.buttons}>
          <Button
            bsStyle="default"
            style={this.state.answer === 1 ? styles.buttonTrue : styles.button}
            disabled
            onClick={() => this.onClick(1)}
          >
            True
          </Button>
          <Button
            bsStyle="default"
            style={this.state.answer === -1 ? styles.buttonFalse : styles.button}
            disabled
            onClick={() => this.onClick(-1)}
          >
            False
          </Button>
        </div>
      </div>
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
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    // backgroundColor: Colors.GRAY,
  },
  buttonTrue: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
  },
  buttonFalse: {
    backgroundColor: Colors.RED,
    color: Colors.WHITE,
  },
};
