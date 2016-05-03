import React, { Component } from 'react';
import {
  Form,
  Button,
  FormControl,
  ControlLabel,
  FormGroup,
} from 'react-bootstrap';

import { Colors } from '../../styles';

export default class TrueFalse extends Component {

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
        answer: 0,
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
  }

  changeQuestion(event) {
    this.props.changeQuestion(this.props._id, {
      text: event.target.value,
    });
  }

  changeFields(value) {
    const fields = this.props.fields;
    fields.answer = fields.answer === value ? 0 : value;
    this.props.changeFields(this.props._id, fields);
  }

  renderEditor() {
    return (
      <Form>
        <FormGroup>
          <ControlLabel style={styles.instruction}>Statement</ControlLabel>
          <FormControl
            style={styles.textArea}
            componentClass="textarea"
            placeholder="Add a statement"
            value={this.props.question.text}
            onChange={this.changeQuestion}
          />
        </FormGroup>
        <FormGroup style={styles.buttons}>
          <Button
            bsStyle="default"
            style={this.props.fields.answer === 1 ? styles.buttonTrue : styles.button}
            onClick={() => this.changeFields(1)}
          >
            True
          </Button>
          <Button
            bsStyle="default"
            style={this.props.fields.answer === -1 ? styles.buttonFalse : styles.button}
            onClick={() => this.changeFields(-1)}
          >
            False
          </Button>
        </FormGroup>
    </Form>
    );
  }

  renderResponder() {
    return (
      <Form>
        <ControlLabel>{this.props.question.text}</ControlLabel>
        <FormGroup style={styles.buttons}>
          <Button
            bsStyle="default"
            style={this.props.fields.answer === 1 ? styles.buttonTrue : styles.button}
            onClick={() => this.changeFields(1)}
          >
            True
          </Button>
          <Button
            bsStyle="default"
            style={this.props.fields.answer === -1 ? styles.buttonFalse : styles.button}
            onClick={() => this.changeFields(-1)}
          >
            False
          </Button>
        </FormGroup>
      </Form>
    );
  }

  renderReader() {
    return (
      <div>
        <p>{this.props.question.text}</p>
        <div style={styles.buttons}>
          <Button
            bsStyle="default"
            style={this.props.fields.answer === 1 ? styles.buttonTrue : styles.button}
            disabled
            onClick={() => this.onClick(1)}
          >
            True
          </Button>
          <Button
            bsStyle="default"
            style={this.props.fields.answer === -1 ? styles.buttonFalse : styles.button}
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
