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

export default class TemplateComponent extends Component {

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

        <h1>{this.props.message}</h1>

        {/* Map array to text components */}
        <ul>
          {this.state.array.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <Button bsStyle="primary" onClick={this.handleClick}>Press me</Button>

        {/* Conditional rendenring (https://github.com/mrpatiwi/render-if) */}
        {renderIf(this.state.something)(() => (
          <h4>This is rendered if <code>something</code> is true</h4>
        ))}

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
