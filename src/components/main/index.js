/* eslint no-console: 0 */

import React, { Component } from 'react';
import { Grid } from 'react-bootstrap';
import Icon from 'react-fa'

import { user, auth } from '../../app';
import NavigationBar from '../navigation-bar';

const STATES = {
  LOADING: 'LOADING',
  AUTHED: 'AUTHED',
  ANNON: 'ANNON',
};

export default class Main extends Component {

  static get propTypes() {
    return {
      title: React.PropTypes.string,
      route: React.PropTypes.any,
      children: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      state: STATES.LOADING,
      error: null,
    };
    this.auth();
  }

  auth() {
    return auth().then(() => {
      console.log('Logged as:', user().name);
      this.setState({ state: STATES.AUTHED });
    }).catch(err => {
      console.log('Auth error:', err);
      this.setState({ state: STATES.ANNON, error: err });
    });
  }

  render() {
    const { route, ...props } = this.props;
    const { title } = route;

    return (
      <div>
        <NavigationBar title={title} fixedTop user={user()} />
        <Grid style={styles.content} {...props}>
          {this.props.children}
        </Grid>
        <footer className="footer">
          <div className="container">
            <p className="text-muted" style={styles.footer}>
              From team5.js with <Icon name="heart" />
            </p>
          </div>
        </footer>
      </div>
    );
  }
}

const styles = {
  content: {
    paddingTop: 80,
  },
  footer: {
    margin: 12,
  },
};
