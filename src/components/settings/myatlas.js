import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
// import renderIf from 'render-if';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class MyAtlas extends Component {

  render() {
    return (
      <div style={styles.container}>
        <h1>My Atlases</h1>
        <Table responsive>
          <tbody>
            <tr>
              <td bold>Quantity</td>
              <td>3</td>
              <td href="#"><a>Edit</a></td>
            </tr>
          </tbody>
        </Table>
      </div>
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
