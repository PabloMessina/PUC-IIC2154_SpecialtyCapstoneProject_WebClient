import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';


export default class CourseStudents extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12}>
            <p>Course evaluations</p>
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
