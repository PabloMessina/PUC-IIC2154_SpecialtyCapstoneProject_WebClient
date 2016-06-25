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
import DocumentTitle from 'react-document-title';
import isEmail from 'validator/lib/isEmail';

import ErrorAlert from '../error-alert';
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
    this.onLoginClick = this.onLoginClick.bind(this);
  }

  onLoginClick() {
    const url = '/login';
    return this.props.router.push(url);
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
    return isEmail(email) ? 'success' : 'warning';
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
      .then(() => login({
        email: this.state.email,
        password: this.state.password,
      }))
      // Go to root
      .then(() => this.props.router.push('/'))
      // Show and error if present
      .catch(error => this.setState({ error }));
  }

  render() {
    return (
      <Grid style={styles.container}>
        <DocumentTitle title="Sign up" />
        <Col xs={12} xsOffset={0} sm={6} smOffset={3} md={4} mdOffset={4} style={styles.panel}>
          <Panel>
            <h3>
              Create Account
            </h3>
            <p>Fill this form to create your account</p>
            <hr />
            <form onSubmit={this.onSubmit}>
              <FormGroup validationState={this.state.nameValidation}>
                <ControlLabel>Name:</ControlLabel>
                <FormControl
                  type="text"
                  label="Name"
                  placeholder="John Smith"
                  value={this.state.name}
                  onChange={e => this.setName(e.target.value)}
                />
                <FormControl.Feedback />
                {renderIf(this.state.nameValidation === 'error')(
                  <HelpBlock>Must have at least 4 characters.</HelpBlock>
                )}
              </FormGroup>
              <FormGroup validationState={this.state.emailValidation}>
                <ControlLabel>Email:</ControlLabel>
                <FormControl
                  type="email"
                  label="Email"
                  placeholder="user@email.com"
                  value={this.state.email}
                  onChange={e => this.setEmail(e.target.value)}
                />
                <FormControl.Feedback />
                {renderIf(this.state.emailValidation === 'error')(
                  <HelpBlock>Invalid email.</HelpBlock>
                )}
              </FormGroup>
              <FormGroup validationState={this.state.passwordValidation}>
                <ControlLabel>Password:</ControlLabel>
                <FormControl
                  type="password"
                  label="Password"
                  placeholder="••••••••••"
                  value={this.state.password}
                  onChange={e => this.setPassword(e.target.value)}
                />
                <FormControl.Feedback />
                {renderIf(this.state.passwordValidation === 'error')(
                  <HelpBlock>Must have at least 4 characters.</HelpBlock>
                )}
              </FormGroup>
              <Button
                block
                bsStyle="primary"
                type="submit"
                value="Submit"
                style={styles.bttn}
              >
                Submit
              </Button>
              <br />
              <a onClick={this.onLoginClick} style={{ cursor: 'pointer' }}>Already have an account? Login here</a>
            </form>

            <ErrorAlert
              error={this.state.error}
              onDismiss={() => this.setState({ error: null })}
            />

          </Panel>
        </Col>
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
  title: {
    textAlign: 'center',
  },
  panel: {
    paddingTop: '50px',
    verticalAlign: 'center',
  },
  bttn: {
    margin: 'auto',
    display: 'block',
  },
};

export default withRouter(SignUp);
