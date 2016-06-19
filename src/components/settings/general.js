import React, { Component } from 'react';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';

import app, { currentUser } from '../../app';
const userService = app.service('/users');

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class General extends Component {
  static get propTypes() {
    return {
      user: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {

    };
  }

  constructor(props) {
    super(props);
    const user = this.props.user || currentUser();
    this.state = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const patch = {
      name: this.state.name,
      email: this.state.email,
    };
    return userService.patch(this.state.id, patch)
      .then(user => this.setState({ user }))
      .catch(error => this.setState({ error }));
  }

  render() {
    return (
      <div style={styles.container}>
        <h1>General</h1>
        <br />
        <form style={styles.container} >
          <FormGroup controlId="name">
            <ControlLabel>Name</ControlLabel>
            <FormControl
              type="text"
              value={this.state.name}
              label="Name"
              onChange={e => this.setState({ name: e.target.value })}
            />
          </FormGroup>
          <FormGroup controlId="email">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              type="text"
              value={this.state.email}
              label="email"
              onChange={e => this.setState({ email: e.target.value })}
            />
          </FormGroup><FormGroup controlId="password">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type="text"
              value={this.state.password}
              label="Password"
              onChange={e => this.setState({ password: e.target.value })}
            />
          </FormGroup>
        </form>
        <hr />

        <Button bsStyle="primary" type="submit" onSubmit={this.onSubmit} >
          Submit Changes
        </Button>
      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
