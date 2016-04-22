/* eslint no-console: 0 */

import React, { Component } from 'react';
import { Grid } from 'react-bootstrap';

import { user, auth } from '../../app';
import NavigationBar from '../navigation-bar';


export default class Main extends Component {

  constructor(props) {
    super(props);
    this.auth();
  }

  auth() {
    return auth().then(() => {
      console.log('Logged as:', user().name);
    }).catch(err => {
      console.log('Auth error:', err);
    });
  }

  render() {
    return (
      <div>
        <NavigationBar title="App" />
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
  content: {},
};
