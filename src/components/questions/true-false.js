import React, { Component } from 'react';
import { Input, Button } from 'react-bootstrap';

import { Colors } from '../../styles';

export default class TrueFalse extends Component {

  static get propTypes() {
    return {
      _id: React.PropTypes.number,
      question: React.PropTypes.object,
      statement: React.PropTypes.string,
      answer: React.PropTypes.number,
      permission: React.PropTypes.string,
      collapsible: React.PropTypes.bool,
      open: React.PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      _id: 0,
      question: { question: { text: '' }, fields: { answer: false } },
      statement: '',
      answer: 0,
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
      answer: props.question.fields.answer || 0,
      permission: props.permission,
      collapsible: props.collapsible,
      open: props.open,
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

  renderEditor() {
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
  }

  renderResponder() {
    return (
      <div>
        <p>{this.state.statement}</p>
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

  renderReader() {
    return (
      <div>
        <p>{this.state.statement}</p>
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
