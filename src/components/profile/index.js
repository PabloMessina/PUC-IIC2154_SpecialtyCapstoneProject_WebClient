import React, { Component } from 'react';
import { Grid, Row, Col, Image, Nav, NavItem, ListGroup, ListGroupItem, Panel } from 'react-bootstrap';
import Icon from 'react-fa';
import moment from 'moment';

import app, { currentUser } from '../../app';
const participantService = app.service('/participants');
const instanceService = app.service('/instances');

export default class UserProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      instances: [],
    };
    this.fetchInstances = this.fetchInstances.bind(this);
  }

  componentDidMount() {
    this.fetchInstances();
  }

  fetchInstances(custom) {
    let query = {
      userId: currentUser().id,
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => {
        query = {
          id: { $in: participants.map(participant => participant.instanceId) },
          $populate: ['course'],
          $sort: { createdAt: -1 },
          ...custom,
        };
        return instanceService.find({ query });
      })
      .then(({ data, total }) => this.setState({ instances: data, total }));
  }

  render() {
    const creation = moment(currentUser().createdAt);
    return (
      <Grid style={styles.container}>
        <Row className="show-grid">
          <Col xsHidden sm={3}>
            <Image src="http://placehold.it/220x229" circle thumbnail responsive />
            <h2>{currentUser().name}</h2>
            <p><Icon name="envelope-o" /> {currentUser().email}</p>
            <hr />
            <h5>Member since: {creation.format('MMMM Do YYYY')}</h5>
          </Col>
          <Col xs={12} sm={9}>
            <Nav bsStyle="tabs" activeKey={1} onSelect={this.handleSelect}>
              <NavItem eventKey={1}><Icon name="tachometer" /> My Activity</NavItem>
            </Nav>
            <br />
            <Row>
              <Col sm={6}>
                <Panel header={<h3><Icon name="clock-o" /> Recent Atlases</h3>}>
                  <ListGroup fill>
                    <ListGroupItem>Calculus 1</ListGroupItem>
                    <ListGroupItem>Calculus 2</ListGroupItem>
                  </ListGroup>
                </Panel>
              </Col>
              <Col sm={6}>
                <Panel header={<h3><Icon name="graduation-cap" /> Courses</h3>}>
                  <ListGroup fill>
                    {this.state.instances.map(instance => (
                      <ListGroupItem>{instance.course.name}</ListGroupItem>
                    ))}
                  </ListGroup>
                </Panel>
              </Col>
            </Row>
            {/*
            <Row>
              <Col xs={12}>
                <Panel bsStyle="info" header={<h3 style={styles.titles}>Activity</h3>}>
                  <h4>{currentUser().name} has no activity during this period.</h4>
                </Panel>
              </Col>
            </Row>
            */}
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  container: {
    paddingTop: 20,
  },
  titles: {
    color: 'black',
  },
};
