import React, { PropTypes, Component } from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';
import renderIf from 'render-if';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

class TemplateComponent extends Component {

  /*
    See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
   */
  static propTypes = {
    message: PropTypes.string,
    style: PropTypes.object,
  }

  static defaultProps = {
    message: 'Template',
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
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState({ something: !this.state.something });
  }

  render() {
    const { message, style, ...props } = this.props;

    return (
      <Grid style={{ ...styles.container, ...style }} {...props}>

        <h1>{message}</h1>

        <Row>
          <Col xs={12}>
            {/* Map array to text components */}
            <ul>
              {this.state.array.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <Button bsStyle="primary" onClick={this.onClick}>Press me</Button>

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

export default withRouter(TemplateComponent);

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
