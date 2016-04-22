import React, { Component } from 'react';
import { Panel, Input, Grid, Row, Col, ButtonInput, Alert } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import { login, join } from '../../app';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class SignUp extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.authenticate = this.authenticate.bind(this);
  }

  onSubmit(e) {
    // Prevent page refresh
    e.preventDefault();
    this.authenticate();
  }

  authenticate() {
    const options = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
    };

    // Hide error message
    this.setState({ error: null });

    // Create account
    return join(options)
      // Login with credentials
      .then(() => login(options))
      // Go to root
      .then(() => browserHistory.push('/'))
      // Show and error if present
      .catch(err => this.setState({ error: err }));
  }

  render() {
    return (
      <div style={styles.container}>
        <Grid>
          <Row>
            <Col md={6}>
              <h1>
                Crear Cuenta
              </h1>
              <p>Descripcion de la aplicación</p>
            </Col>
            <Col md={6}>
              <Panel>
                <form onSubmit={this.onSubmit}>
                  <Input
                    type="text"
                    label="Nombre"
                    value={this.state.name}
                    onChange={e => this.setState({ name: e.target.value })}
                  />
                  <Input
                    type="email"
                    label="Email"
                    value={this.state.email}
                    onChange={e => this.setState({ email: e.target.value })}
                  />
                  <Input
                    type="password"
                    label="Clave"
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value })}
                  />
                  <ButtonInput bsStyle="primary" type="submit" value="Siguiente" />
                </form>

                {renderIf(this.state.error)(() =>
                  <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
                    <h4>Oh snap! You got an error!</h4>
                    <p>{this.state.error.message}</p>
                  </Alert>
                )}

              </Panel>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
SignUp.propTypes = {

};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
