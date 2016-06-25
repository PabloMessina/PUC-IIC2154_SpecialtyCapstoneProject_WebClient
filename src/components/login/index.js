import React, { Component } from 'react';
import {
  Panel,
  Grid,
  Col,
  Button,
  FormGroup,
  FormControl,
  Image,
} from 'react-bootstrap';
import ErrorAlert from '../error-alert';
import DocumentTitle from 'react-document-title';
import { withRouter } from 'react-router';
import isEmail from 'validator/lib/isEmail';

import { login } from '../../app';


class Login extends Component {

  static get propTypes() {
    return {
      location: React.PropTypes.any,
      router: React.PropTypes.object,
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
      email: '',
      password: '',
      error: null,
    };

    // ES6 bindings
    // See: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md#es6-classes
    this.authenticate = this.authenticate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onSignupClick = this.onSignupClick.bind(this);
  }

  onSubmit(e) {
    // Prevent page refresh
    e.preventDefault();
    this.authenticate();
  }

  onSignupClick() {
    const url = '/signup';
    return this.props.router.push(url);
  }

  setEmail(value) {
    const email = value || '';
    this.setState({ email, emailValidation: this.validateEmail(email) });
  }

  validateEmail(email) {
    return isEmail(email) ? 'success' : 'warning';
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
          return this.props.router.push(location.state.redirection);
        }
        return this.props.router.push('/');
      })
      // Show and error if present
        .catch(err => this.setState({ error: err }));
  }

  render() {
    return (
      <Grid>
        <DocumentTitle title="Login" />
        <Col xs={12} xsOffset={0} sm={6} smOffset={3} md={4} mdOffset={4} style={styles.panel}>
          <Panel>
            <Image
              src="/img/logo.png"
              style={styles.logo}
              responsive
            />
            <hr />
            <form onSubmit={this.onSubmit}>
              <FormGroup controlId="name" validationState={this.state.emailValidation}>
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
                <FormControl
                  type="password"
                  label="Password"
                  placeholder="••••••••••"
                  value={this.state.password}
                  onChange={e => this.setState({ password: e.target.value })}
                />
              </FormGroup>
              <br />
              <Button
                block
                type="submit"
                bsStyle="primary"
                style={styles.bttn}
                disabled={this.state.submiting}
              >
                Login
              </Button>
              <br />
              <a onClick={this.onSignupClick} style={{ cursor: 'pointer' }}>Don't have an account? Sign up here</a>
            </form>
            <br />

            {/*
            Render only if there is an error.
            Notice '() => (<...>)', this makes makes the closure lazy
            */}
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

const styles = {
  panel: {
    paddingTop: '70px',
    verticalAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
  bttn: {
    margin: 'auto',
    display: 'block',
  },
  logo: {
    width: '70px',
    height: '70px',
    margin: 'auto',
  },
};

export default withRouter(Login);
