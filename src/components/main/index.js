/* eslint no-console: 0 */

import React, { Component } from 'react';
import { Grid } from 'react-bootstrap';

import { user, auth } from '../../app';
import NavigationBar from '../navigation-bar';

const STATES = {
  LOADING: 'LOADING',
  AUTHED: 'AUTHED',
  ANNON: 'ANNON',
};

export default class Main extends Component {

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
    return (
      <div>
        <NavigationBar title="App" fixedTop user={user()} />
        <Grid style={styles.content}>
          {this.props.children}
        </Grid>
      </div>
    );
  }
}

Main.propTypes = {
  children: React.PropTypes.object,
};

const styles = {
  content: {
    paddingTop: 80,
  },
};
