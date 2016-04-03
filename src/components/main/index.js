import React, { Component } from 'react';
import { Grid } from 'react-bootstrap';

import NavigationBar from '../navigation-bar';


export default class Main extends Component {
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
