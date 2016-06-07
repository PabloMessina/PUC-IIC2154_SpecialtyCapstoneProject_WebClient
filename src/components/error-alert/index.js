import React, { Component, PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

export default class ErrorAlert extends Component {
  static get propTypes() {
    return {
      error: PropTypes.any,
      onDismiss: PropTypes.func.isRequired,
    };
  }

  render() {
    const { error, onDismiss } = this.props;
    if (!error) {
      return null;
    }

    return (
      <Alert bsStyle="danger" onDismiss={onDismiss} style={styles.alert}>
        <h4>Oh snap! You got an error!</h4>
        <p>{error.message}</p>
      </Alert>
    );
  }
}
const styles = {
  alert: {
    margin: 5,
  },
};
