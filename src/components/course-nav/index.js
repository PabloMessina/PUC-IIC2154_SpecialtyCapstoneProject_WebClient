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

export default class CourseNav extends Component {

  constructor(props) {
    super(props);
    this.state = {
      elements: [
        {
          path: 'Calendar',
        }, {
          path: 'Students',
        }, {
          path: 'Analytics',
        },
      ],
    };
  }

  render() {
    return (
      <div style={styles.container}>
        <Grid>
          <Col sm={6} md={3}>
            <ListGroup>
              {this.state.elements.map((ele, i) => (
                <ListGroupItem key={i} onClick={() => browserHistory.push(`/course_general/${ele.path}`)}>
                  {ele.path}
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
CourseNav.propTypes = {
  children: React.PropTypes.any,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
