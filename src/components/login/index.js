import React, { Component } from 'react';
import { Panel, Row, Col, Input, ButtonInput, Alert } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import app from '../../app';


export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: 'admin@uc.cl',
      password: 'admin',
      error: null,
    };

    // ES6 bindings
    // See: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md#es6-classes
    this.authenticate = this.authenticate.bind(this);
  }

  authenticate() {
    const options = {
      type: 'local',
      email: this.state.email,
      password: this.state.password,
    };

    return app.authenticate(options)
      .then(result => {
        // Hide error message
        this.setState({ error: null });
        // Go to root
        browserHistory.push('/');
        // End promise
        return result;
      })
      .catch(err => {
        // Show error
        this.setState({ error: err });
      });
  }

  render() {
    return (
      <Row className="show-grid">
        <Col xs={6} xsOffset={3}>
          <Panel>

            <Input
              type="text"
              label="Email Address"
              placeholder="user@email.com"
              value={this.state.email}
              onChange={e => this.setState({ email: e.target.value })}
            />

            <Input
              type="password"
              label="Password"
              value={this.state.password}
              onChange={e => this.setState({ password: e.target.value })}
            />

            <ButtonInput
              type="submit"
              bsStyle="primary"
              value="Log in"
              onClick={this.authenticate}
            />

            {/*
              Render only if there is an error.
              Notice '() => (<...>)', this makes makes the closure lazy
            */}
            {renderIf(this.state.error)(() =>
              <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
                <h4>Oh snap! You got an error!</h4>
                <p>{this.state.error.message}</p>
              </Alert>
            )}

          </Panel>
        </Col>
      </Row>
    );
  }
}
