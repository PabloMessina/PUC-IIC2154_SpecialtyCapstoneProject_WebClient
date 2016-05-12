import React, { Component, PropTypes } from 'react';
import {
  Button,
  Modal,
} from 'react-bootstrap';

import CreateQuestion from './index';


export default class CreateQuestionModal extends Component {

  static get propTypes() {
    return {
      question: PropTypes.object,
      onSave: PropTypes.func,
      onHide: PropTypes.func,
    };
  }

  constructor(props) {
    super(props);
    this.onHide = this.onHide.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onSave() {
    const question = this.refs.creator.getQuestion();
    this.props.onSave(question);
  }

  onHide() {
    const question = this.refs.creator.getQuestion();
    this.props.onHide(question);
  }

  render() {
    const { question, ...props } = this.props;
    return (
      <Modal {...props} onHide={this.onHide}>
        <Modal.Header closeButton>
          <Modal.Title id="question-modal">Create question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateQuestion ref="creator" question={question} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onHide}>Close</Button>
          <Button bsStyle="primary" onClick={this.onSave}>Save and publish</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
