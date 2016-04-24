import React, { Component } from 'react';
import { Grid, Row, Col, DropdownButton, MenuItem } from 'react-bootstrap';


export default class Questions extends Component {

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
          <DropdownButton
            title={'hola'}
          >
            <MenuItem eventKey="1">Hola</MenuItem>
          </DropdownButton>
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
