import React, { Component } from 'react';
// import { Button } from 'react-bootstrap';


export default class MinTemplate extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <div style={styles.container}>
        <p>Hello world</p>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
