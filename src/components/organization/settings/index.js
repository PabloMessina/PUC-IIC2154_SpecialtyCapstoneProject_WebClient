import React, { Component } from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import Icon from 'react-fa';

const ELEMENTS = [
  {
    name: 'General',
    path: 'general',
    icon: 'rocket',
  }, {
    name: 'Administrative',
    path: 'administrative',
    icon: 'exclamation-triangle',
  },
];

export default class SettingsTab extends Component {

  static get propTypes() {
    return {
      children: React.PropTypes.any,
      organization: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
    };
    this.renderListElement = this.renderListElement.bind(this);
  }

  renderListElement(element, i) {
    const organization = this.props.organization;
    const url = `/organizations/show/${organization.id}/settings/${element.path}`;
    return (
      <ListGroupItem key={i} onClick={() => browserHistory.push(url)}>
        <Icon style={styles.icon} name={element.icon} /> {element.name}
      </ListGroupItem>
    );
  }

  render() {
    const organization = this.props.organization;

    return (
      <Grid style={styles.container}>
        <Row>
          <Col xs={12} sm={3} md={3}>
            <ListGroup>
              {ELEMENTS.map((element, i) => this.renderListElement(element, i))}
            </ListGroup>
          </Col>
          <Col xs={12} sm={9} md={9}>
            {React.cloneElement(this.props.children, { organization })}
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
  icon: {
    marginRight: 7,
  },
};
