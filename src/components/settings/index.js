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
      message: 'Template',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      array: ['zero', 'one', 'two'],
      something: true,
    };
  }

  render() {
    return (
      <div style={styles.container}>
      <Grid>
           <Col sm={6} md={3}>
            <h1></h1>
            <ListGroup>
              <ListGroupItem onClick={() => browserHistory.push('/settings')}>
              General</ListGroupItem>
              <ListGroupItem onClick={() => browserHistory.push('/settings/security')}>
              Seguridad</ListGroupItem>
              <ListGroupItem onClick={() => browserHistory.push('/settings/notifications')}>
              Notificaciones</ListGroupItem>
              <ListGroupItem onClick={() => browserHistory.push('/settings/payments')}>
              Pagos</ListGroupItem>
              <ListGroupItem onClick={() => browserHistory.push('/settings/myatlas')}>
              Mis Atlas</ListGroupItem>
            </ListGroup>
           </Col>
           <Col sm={6} md={9}>
            {this.props.children}
           </Col>
       </Grid>
      </div>
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
};
