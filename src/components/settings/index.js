import React, { Component } from 'react';
import { Col, Grid, ListGroup, ListGroupItem } from 'react-bootstrap';
import { withRouter } from 'react-router';
import DocumentTitle from 'react-document-title';
// import renderIf from 'render-if';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

class Settings extends Component {

  static get propTypes() {
    return {
      router: React.PropTypes.object,
      children: React.PropTypes.object,
    };
  }

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
    // Buttons hidden because it's incomplete
    return (
      <Grid style={styles.container}>
        <DocumentTitle title="Settings" />
        <Col sm={6} md={3}>
          <h1></h1>
          <ListGroup>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 1}
              onClick={() => {
                this.props.router.push('/settings');
                this.setState({ selected: 1 });
              }}
            >
              General
            </ListGroupItem>
            {/*<ListGroupItem
              style={styles.lista}
              active={this.state.selected === 2}
              onClick={() => {
                this.props.router.push('/settings/security');
                this.setState({ selected: 2 });
              }}
            >
              Security
            </ListGroupItem>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 3}
              onClick={() => {
                this.props.router.push('/settings/notifications');
                this.setState({ selected: 3 });
              }}
            >
              Notifications
            </ListGroupItem>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 4}
              onClick={() => {
                this.props.router.push('/settings/payments');
                this.setState({ selected: 4 });
              }}
            >
              Payments
            </ListGroupItem>
            <ListGroupItem
              style={styles.lista}
              active={this.state.selected === 5}
              onClick={() => {
                this.props.router.push('/settings/myatlas');
                this.setState({ selected: 5 });
              }}
            >
              My Atlases
            </ListGroupItem>*/}
          </ListGroup>
        </Col>
        <Col sm={6} md={9}>
           {this.props.children}
        </Col>
      </Grid>
    );
  }
}

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

export default withRouter(Settings);
