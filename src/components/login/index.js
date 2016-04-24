  import React, { Component } from 'react';
  import {
    Panel,
    Grid,
    Col,
    Button,
    Alert,
    FormGroup,
    FormControl,
    ControlLabel,
  } from 'react-bootstrap';

  import { browserHistory } from 'react-router';
  import renderIf from 'render-if';

  import { login } from '../../app';


  export default class Login extends Component {

    static get propTypes() {
      return {
        redirection: React.PropTypes.string,
        location: React.PropTypes.any,
      };
    }

    static get defaultProps() {
      return {
        emailValidation: null,
      };
    }

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
      this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(e) {
      // Prevent page refresh
      e.preventDefault();
      this.authenticate();
    }

    setEmail(value) {
      const email = value || '';
      this.setState({ email, emailValidation: this.validateEmail(email) });
    }

    validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(email)) return 'success';
      return 'warning';
    }

    authenticate() {
      const options = {
        email: this.state.email,
        password: this.state.password,
      };

      // Hide error message
      this.setState({ error: null });

      // Login with credentials
      return login(options)
        // Go to root
        .then(() => {
          const { location } = this.props;
          if (location.state && location.state.redirection) {
            return browserHistory.push(location.state.redirection);
          }
          return browserHistory.push('/');
        })
        // Show and error if present
        .catch(err => this.setState({ error: err }));
    }

    render() {
      return (
        <Grid>
          <Col xs={12} xsOffset={0} md={6} mdOffset={3}>
            <Panel>
              <form onSubmit={this.onSubmit}>
                <FormGroup controlId="name" validationState={this.state.emailValidation}>
                  <ControlLabel>Email Address</ControlLabel>
                  <FormControl
                    type="text"
                    label="Email Address"
                    placeholder="user@email.com"
                    value={this.state.email}
                    onChange={e => this.setEmail(e.target.value)}
                  />
                  <FormControl.Feedback />
                </FormGroup>

                <FormGroup>
                  <ControlLabel>Password</ControlLabel>
                  <FormControl
                    type="password"
                    label="Password"
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value })}
                  />
                </FormGroup>
                <Button
                  type="submit"
                  bsStyle="primary"
                  disabled={this.state.submiting}
                >
                  Log in
                </Button>
              </form>

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
        </Grid>
      );
    }
  }
