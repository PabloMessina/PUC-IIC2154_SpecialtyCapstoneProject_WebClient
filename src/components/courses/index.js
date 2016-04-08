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

  static get defaultProps() {
    return {
      message: 'Template',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      organizations: [
        {
          _id: 'uc',
          title: 'UC',
        }, {
          _id: 'uchile',
          title: 'UCHILE',
        }, {
          _id: 'usach',
          title: 'USACH',
        }, {
          _id: 'utfsm',
          title: 'UTFSM',
        }, {
          _id: 'udd',
          title: 'UDD',
        }, {
          _id: 'unab',
          title: 'UNAB',
        },
      ],
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
      <div style={styles.container}>
        <Grid>
          <Col sm={6} md={3}>
            <ListGroup>
              {this.state.organizations.map(org => {
                return (
                  <ListGroupItem onClick={() => browserHistory.push('/courses/' + org._id)}>
                    {org.title}
                  </ListGroupItem>
                );
              })}
            </ListGroup>
            </Col>
            <Col sm={6} md={9}>
             {this.props.children}
            </Col>
        </Grid>
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
