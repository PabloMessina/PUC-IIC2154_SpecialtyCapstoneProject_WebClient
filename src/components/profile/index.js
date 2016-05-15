import React, { Component } from 'react';
import { Row, Col, Image, Nav, NavItem, ListGroup, ListGroupItem, Panel, Glyphicon } from 'react-bootstrap';

import app, { currentUser } from '../../app';
const participantService = app.service('/participants');

export default class UserProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: [],
    };
    this.fetchUsers = this.fetchUsers.bind(this);
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers() {
    const query = {
      userId: currentUser().id,
      $populate: 'user',
    };
    participantService.find({ query })
		.then(result => result.data)
		.then(participantships => {
  this.setState({ user: participantships });
			// console.log(participantships);
			// ...
		});
		// .catch(err => console.log(err));
  }

  render() {
    console.log(currentUser());
    return (
      <div style={styles.container}>
        <Row className="show-grid">
          <Col xs={12} md={3}>
            <Image src="http://placehold.it/220x229" circle thumbnail responsive />
            <h1>{currentUser().name}</h1>
            <h5><Glyphicon glyph="envelope" /> {currentUser().email}</h5>
            <hr />
            <h4>Member since: {currentUser().createdAt}</h4>
          </Col>
          <Col xs={6} md={9}>
            <Nav bsStyle="tabs" activeKey={1} onSelect={this.handleSelect}>
              <NavItem eventKey={1}><Glyphicon glyph="dashboard" /> My Activity</NavItem>
            </Nav>
            <br />
            <div>
              <Row>
                <Col md={6}>
                  <ListGroup>
                    <ListGroupItem bsStyle="info" style={styles.titles}><Glyphicon glyph="heart-empty" /> Favorite Atlases</ListGroupItem>
                    <ListGroupItem>Calculus 1</ListGroupItem>
                    <ListGroupItem>Calculus 2</ListGroupItem>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup>
                    <ListGroupItem bsStyle="info" style={styles.titles}><Glyphicon glyph="education" /> Courses</ListGroupItem>
                    <ListGroupItem>Anatomy</ListGroupItem>
                    <ListGroupItem>Calculus 1</ListGroupItem>
                  </ListGroup>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <Panel header={"Activity"}>
                    <h4>{currentUser().name} has no activity during this period.</h4>
                  </Panel>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {
    padding: 30,
    paddingLeft: 130,
    paddingRight: 130,
  },
  titles: {
    color: 'black',
  },
};
