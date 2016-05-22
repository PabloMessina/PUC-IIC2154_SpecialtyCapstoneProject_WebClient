import React, { Component } from 'react';
import { Col, Grid, ListGroup, ListGroupItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';
// import renderIf from 'render-if';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class Settings extends Component {

  static get defaultProps() {
    return {

    };
  }

  constructor(props) {
    super(props);
    this.state = {
      selected: 1,
    };
  }

  render() {
    return (
      <Grid style={styles.container}>
        <Col sm={6} md={3}>
          <h1></h1>
          <ListGroup>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 1}
              onClick={() => {
                browserHistory.push('/settings');
                this.setState({ selected: 1 });
              }}
            >
              General
            </ListGroupItem>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 2}
              onClick={() => {
                browserHistory.push('/settings/security');
                this.setState({ selected: 2 });
              }}
            >
              Security
            </ListGroupItem>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 3}
              onClick={() => {
                browserHistory.push('/settings/notifications');
                this.setState({ selected: 3 });
              }}
            >
              Notifications
            </ListGroupItem>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 4}
              onClick={() => {
                browserHistory.push('/settings/payments');
                this.setState({ selected: 4 });
              }}
            >
              Payments
            </ListGroupItem>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 5}
              onClick={() => {
                browserHistory.push('/settings/myatlas');
                this.setState({ selected: 5 });
              }}
            >
              My Atlases
            </ListGroupItem>
          </ListGroup>
        </Col>
        <Col sm={6} md={9}>
           {this.props.children}
        </Col>
      </Grid>
    );
  }
}

Settings.propTypes = {
  children: React.PropTypes.object,
};


/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
  lista: {
    margin: 3,
  },
};
