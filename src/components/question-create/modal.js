/* eslint no-console:0, no-param-reassign:0, no-alert:0, react/sort-comp:0, key-spacing:0, no-multi-spaces:0 */
import React, { Component, PropTypes } from 'react';
import {
  Button,
  Modal,
} from 'react-bootstrap';
import ErrorAlert from '../error-alert';
import CreateQuestion from './index';
import isEqual from 'lodash/isEqual';


export default class CreateQuestionModal extends Component {

  static get propTypes() {
    return {
      question: PropTypes.object,
      edit: PropTypes.bool,
      onSave: PropTypes.func,
      onHide: PropTypes.func,
      externalErrors: PropTypes.array,
      onDismissExternalError: PropTypes.func,
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
      internalErrors: [],
      externalErrors: props.externalErrors || [],
    };
    this.onHide = this.onHide.bind(this);
    this.onSave = this.onSave.bind(this);
    this.dismissInternalError = this.dismissInternalError.bind(this);
  }

  dismissInternalError(error) {
    let errors = this.state.internalErrors;
    const i = errors.indexOf(error);
    if (i > -1) {
      errors = errors.slice(0);
      errors.splice(i, 1);
      this.setState({ internalErrors: errors });
    }
  }

  componentWillReceiveProps(nextProps) {
    // update external errors if they change
    if (!isEqual(this.props.externalErrors, nextProps.externalErrors)) {
      this.setState({ externalErrors: nextProps.externalErrors || [] });
    }
  }

  onSave() {
    const question = this.refs.creator.getQuestion();
    const { content, fields, answer, qtype } = question;

    const internalErrors = [];

    if (!content) {
      internalErrors.push(new Error('Question is missing content.'));
    }

    if (!fields && ['multiChoice', 'correlation'].includes(qtype)) {
      internalErrors.push(new Error('Question is missing fields.'));
    }

    if (!answer) {
      internalErrors.push(new Error('Question is missing an answer.'));
    }

    this.setState({ internalErrors });

    if (internalErrors.length === 0) this.props.onSave(question);
  }

  onHide() {
    const question = this.refs.creator.getQuestion();
    this.props.onHide(question);
  }

  render() {
    const { question, edit, ...props } = this.props;
    const { internalErrors, externalErrors } = this.state;

    // error alerts
    const internalErrorAlerts = internalErrors.map((error, i) =>
      <ErrorAlert
        key={`iea${i}`}
        error={error}
        onDismiss={() => this.dismissInternalError(error)}
      />);
    const externalErrorAlerts = externalErrors.map((error, i) =>
      <ErrorAlert
        key={`eea${i}`}
        error={error}
        onDismiss={() => this.props.onDismissExternalError(error)}
      />);

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
          {internalErrorAlerts}
          {externalErrorAlerts}
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
