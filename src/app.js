import React, { Component } from 'react';

import NavigationBar from './components/navigation-bar';


export default class App extends Component {
  render() {
    return (
      <div>
        <NavigationBar title="App" />
        <div className="container" style={styles.content}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.object,
};

const styles = {
  content: {},
};
