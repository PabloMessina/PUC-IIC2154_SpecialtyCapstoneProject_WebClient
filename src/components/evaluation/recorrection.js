import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';


export default class EvaluationRecorrection extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <Grid style={styles.container}>
        <Row>
          <Col xs={12}>
            <p>Hello world</p>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
};
