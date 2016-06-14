import React, { Component, PropTypes } from 'react';
import {
  Button,
  Modal,
  Alert,
} from 'react-bootstrap';

import renderIf from 'render-if';
import CreateQuestion from './index';


export default class CreateQuestionModal extends Component {

  static get propTypes() {
    return {
      question: PropTypes.object,
      edit: PropTypes.bool,
      onSave: PropTypes.func,
      onHide: PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      edit: true,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
    this.onHide = this.onHide.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onSave() {
    const question = this.refs.creator.getQuestion();
    const { content, fields, answer, qtype } = question;
    if (!content) return this.setState({ error: new Error('Question is missing content.') });

    if (!fields && (qtype === 'multiChoice' || qtype === 'correlation')) return this.setState({ error: new Error('Question is missing fields.') });

    if (!answer) return this.setState({ error: new Error('Question is missing an answer.') });

    this.setState({ error: null });
    return this.props.onSave(question);
  }

  onHide() {
    const question = this.refs.creator.getQuestion();
    this.props.onHide(question);
  }

  render() {
    const { question, edit, ...props } = this.props;
    const { error } = this.state;
    const m = error ? error.message : '';
    return (
      <Modal {...props} onHide={this.onHide} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title
            id="question-modal"
          >
            {edit ? 'Edit question' : 'Create question'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderIf(m !== '')(
            <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })} >
              <p>{m}</p>
            </Alert>
          )}
          <CreateQuestion ref="creator" question={question} edit={edit} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onHide}>Close</Button>
          <Button bsStyle="primary" onClick={this.onSave}>Save and publish</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
