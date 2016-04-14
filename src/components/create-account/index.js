import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import renderIf from 'render-if';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class CreateAccount extends Component {

  static get defaultProps() {
    return {
      message: 'Template',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      array: ['zero', 'one', 'two'],
      something: true,
    };
  }

  render() {
    return (
      <div style={styles.container}>
        <h1>
          Crear Cuenta
        </h1>
      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
CreateAccount.propTypes = {
  message: React.PropTypes.string,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
