import React, { Component } from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
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
      <Grid style={styles.container}>

        <h1>{this.props.message}</h1>

        <Row>
          <Col xs={12}>
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
          </Col>
        </Row>

      </Grid>
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
