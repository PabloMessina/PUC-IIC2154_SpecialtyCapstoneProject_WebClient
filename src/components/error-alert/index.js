/* eslint no-console: 0 */

import React, { Component, PropTypes } from 'react';
import { Alert } from 'react-bootstrap';

export default class ErrorAlert extends Component {
  static get propTypes() {
    return {
      error: PropTypes.any,
      onDismiss: PropTypes.func,
    };
  }

  renderAlert = (innerString) => {
    const { onDismiss } = this.props;
    return (
      <Alert bsStyle="danger" onDismiss={onDismiss} style={styles.alert}>
        {/* <h4>Oh snap! You got an error!</h4> */}
        <p>{innerString}</p>
      </Alert>
    );
  }

  render() {
    const { error } = this.props;
    if (!error) {
      return null;
    }

    // TODO: NewRelic should log this? Although some errors are trivial...

    if (typeof error === 'string') {
      console.warn('Oh snap! You got an error!');
      console.warn(error);
      return this.renderAlert(error);
    }

    if (error.message) {
      console.warn('Oh snap! You got an error!');
      console.dir(error);
      return this.renderAlert(error.message);
    }

    // console.warn('Someone set "state.error" with something that is not an error!', error);
    return null;
  }
}

const styles = {
  alert: {
    margin: 5,
  },
};
