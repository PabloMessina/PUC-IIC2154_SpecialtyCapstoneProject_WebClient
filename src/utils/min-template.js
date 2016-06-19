import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';


export default class MinTemplate extends Component {

  static propTypes = {}

  static defaultProps = {}

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
            <p>Hello world</p>
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
