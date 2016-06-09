import React, { Component, PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

export default class ErrorAlert extends Component {
  static get propTypes() {
    return {
      error: PropTypes.any,
      onDismiss: PropTypes.func,
    };
  }

  render() {
    const { error, onDismiss } = this.props;
    if (!error) {
      return null;
    }

    if (error.message) {
      console.warn('Oh snap! You got an error!'); // eslint-disable-line
      console.dir(error);   // eslint-disable-line
      // TODO: NewRelic should log this?

      return (
        <Alert bsStyle="danger" onDismiss={onDismiss} style={styles.alert}>
          <h4>Oh snap! You got an error!</h4>
          <p>{error.message}</p>
        </Alert>
      );
    }

    // console.warn('Someone set "state.error" with something that is not an error!', error);   // eslint-disable-line
    return null;
  }
}

const styles = {
  alert: {
    margin: 5,
  },
};
