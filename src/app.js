import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

import HelloWorld from './components/helloworld';


export default class App extends Component {
  render() {
    return (
      <div>
        <HelloWorld subtitle="Hey! i'm a prop" />
        <Button>Default</Button>
      </div>
    );
  }
}
