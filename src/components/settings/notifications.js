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

export default class Notifications extends Component {

  render() {
    return (
      <div style={styles.container}>
        <h1>Notifications</h1>
        <Table responsive>
          <tbody>
            <tr>
              <td bold>Web</td>
              <td>Sound, Pop-ups, Etiquetas</td>
              <td href="#"><a>Edit</a></td>
            </tr>
            <tr>
              <td>Android</td>
              <td>Sound, Pop-ups</td>
              <td href="#"><a>Edit</a></td>
            </tr>
            <tr>
              <td>iOS</td>
              <td>Sound</td>
              <td href="#"><a>Edit</a></td>
            </tr>
            <tr>
              <td>Email</td>
              <td></td>
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
