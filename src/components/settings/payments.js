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

export default class Payments extends Component {

  render() {
    return (
      <div style={styles.container}>
        <h1>Payments</h1>
        <Table responsive>
          <tbody>
            <tr>
              <td bold>State</td>
              <td>OK</td>
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
