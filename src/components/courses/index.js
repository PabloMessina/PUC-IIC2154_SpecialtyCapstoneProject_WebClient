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

export default class Courses extends Component {

  static get defaultProps() {
    return {
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
  }

  constructor(props) {
    super(props);
    this.state = {
      organizations: props.organizations,
    };
  }

  render() {
    return (
      <div style={styles.container}>
        <Grid>
          <Col sm={6} md={3}>
            <ListGroup>
              {this.state.organizations.map((org, i) => (
                <ListGroupItem key={i} onClick={() => browserHistory.push(`/courses/${org._id}`)}>
                  {org.title}
                </ListGroupItem>
              ))}
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
Courses.propTypes = {
  children: React.PropTypes.any,
  organizations: React.PropTypes.array,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
