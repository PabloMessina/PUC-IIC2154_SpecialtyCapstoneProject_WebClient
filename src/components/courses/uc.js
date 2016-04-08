import React, { Component } from 'react';
import { Grid, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';
/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class TemplateComponent extends Component {

  constructor(props) {
    super(props);
    this.state = { };

    // ES6 bindings
    // See: https://facebook.github.io/react/docs/reusable-components.html#es6-classes
    // See: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md#es6-classes
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ something: !this.state.something });
  }

  render() {
    return (
      <div style={styles.container}>

      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
TemplateComponent.propTypes = {
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
