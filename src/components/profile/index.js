import React, { Component } from 'react';
import { Row, Col, Image, Nav, NavItem, ListGroup, ListGroupItem } from 'react-bootstrap';


export default class UserProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <div style={styles.container}>
        <Row className="show-grid">
          <Col xs={12} md={3}><Image src="http://placehold.it/220x229" circle thumbnail responsive /></Col>
          <Col xs={6} md={9}>
            <Nav bsStyle="tabs" activeKey={1} onSelect={this.handleSelect}>
              <NavItem eventKey={1}>My Content</NavItem>
              <NavItem eventKey={2}>My Courses</NavItem>
            </Nav>
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {
    padding: 30,
    paddingLeft: 95,
  },
};
