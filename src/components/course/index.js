import React, { Component } from 'react';
import { Grid, Col, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      elements: [
        {
          path: 'Evaluations',
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
      <Grid style={styles.container}>
        <h1>{this.props.params.courseId}</h1>
        <Row>
           <Col xs={12} sm={6} md={3}>
            <ListGroup>
              {this.state.elements.map((ele, i) => (
                <ListGroupItem key={i} onClick={() => browserHistory.push(`/course_general/${ele.path}`)}>
                  {ele.path}
                </ListGroupItem>
              ))}
            </ListGroup>
          </Col>
          <Col xs={12} sm={6} md={9}>
           {this.props.children}
          </Col>
        </Row>
      </Grid>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
Course.propTypes = {
  children: React.PropTypes.any,
  // React Router
  params: React.PropTypes.object,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
