import React, { Component } from 'react';
import {
  Panel,
  Grid,
  Row,
  Col,
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
} from 'react-bootstrap';
import { withRouter } from 'react-router';
import renderIf from 'render-if';
import ErrorAlert from '../error-alert';
import DocumentTitle from 'react-document-title';

import { login, join } from '../../app';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

class SignUp extends Component {

  static get propTypes() {
    return {
      router: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      emailValidation: null,
      nameValidation: null,
    };
  }

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

  setEmail(value) {
    const email = value || '';
    this.setState({ email, emailValidation: this.validateEmail(email) });
  }

  setName(value) {
    const name = value || '';
    this.setState({ name, nameValidation: this.validateName(name) });
  }

  setPassword(value) {
    const password = value || '';
    this.setState({ password, passwordValidation: this.validatePassword(password) });
  }

  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email)) return 'success';
    return 'error';
  }

  validateName(name) {
    if (name && name.length > 3) return 'success';
    return 'error';
  }

  validatePassword(password) {
    if (password && password.length > 3) return 'success';
    return 'error';
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
      .then(() => this.props.router.push('/'))
      // Show and error if present
      .catch(err => this.setState({ error: err }));
  }

  render() {
    return (
      <Grid style={styles.container}>
        <DocumentTitle title="Sign up" />
        <Row>
          <Col xs={12}>
            <h1>
              Create Account
            </h1>
            <p>Fill this form to create your account</p>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Panel>
              <form onSubmit={this.onSubmit}>
                <FormGroup validationState={this.state.nameValidation}>
                  <ControlLabel>Name</ControlLabel>
                  <FormControl
                    type="text"
                    label="Name"
                    value={this.state.name}
                    onChange={e => this.setName(e.target.value)}
                  />
                  <FormControl.Feedback />
                  {renderIf(this.state.nameValidation === 'error')(
                    <HelpBlock>Must have at least 4 characters.</HelpBlock>
                  )}
                </FormGroup>
                <FormGroup validationState={this.state.emailValidation}>
                  <ControlLabel>Email</ControlLabel>
                  <FormControl
                    type="email"
                    label="Email"
                    value={this.state.email}
                    onChange={e => this.setEmail(e.target.value)}
                  />
                  <FormControl.Feedback />
                  {renderIf(this.state.emailValidation === 'error')(
                    <HelpBlock>Invalid email.</HelpBlock>
                  )}
                </FormGroup>
                <FormGroup validationState={this.state.passwordValidation}>
                  <ControlLabel>Password</ControlLabel>
                  <FormControl
                    type="password"
                    label="Password"
                    value={this.state.password}
                    onChange={e => this.setPassword(e.target.value)}
                  />
                  <FormControl.Feedback />
                  {renderIf(this.state.passwordValidation === 'error')(
                    <HelpBlock>Must have at least 4 characters.</HelpBlock>
                  )}
                </FormGroup>
                <Button
                  bsStyle="primary"
                  type="submit"
                  value="Submit"
                >
                  Submit
                </Button>
              </form>

              <ErrorAlert
                error={this.state.error}
                onDismiss={() => this.setState({ error: null })}
              />

            </Panel>
          </Col>
        </Row>
      </Grid>
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

export default withRouter(SignUp);
