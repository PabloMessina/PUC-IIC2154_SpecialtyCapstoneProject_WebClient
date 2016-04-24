import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import Questions from './questions';

export default class EvaluationCreate extends Component {

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
            <Questions />
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
