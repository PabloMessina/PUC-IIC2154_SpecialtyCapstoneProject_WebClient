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

export default class General extends Component {

  render() {
    return (
      <div style={styles.container}>
        <h1>General</h1>
        <Table responsive>
          <tbody>
            <tr>
              <td bold>Name</td>
              <td>Juan Perez</td>
              <td href="#"><a>Edit</a></td>
            </tr>
            <tr>
              <td>Email</td>
              <td>jperez@uc.cl</td>
              <td href="#"><a>Edit</a></td>
            </tr>
            <tr>
              <td>Password</td>
              <td>******</td>
              <td href="#"><a>Edit</a></td>
            </tr>
            <tr>
              <td>Organizations</td>
              <td>Universidad Católica</td>
              <td href="#"><a>Edit</a></td>
            </tr>
            <tr>
              <td>Role</td>
              <td>Estudiante</td>
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
