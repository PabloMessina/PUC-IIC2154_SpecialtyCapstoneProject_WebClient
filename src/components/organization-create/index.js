import React, { Component } from 'react';
import { Button, Col, Input, Combobox, MenuItem, DropdownButton, ButtonToolbar} from 'react-bootstrap';
import renderIf from 'render-if';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class CourseCreate extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      mail: '',
      country: '',
      address: '',
      contact: '',
      suscription: '',
      logo: '',
    };
  }
  addAtlas(atlas) {
    // const students = [].concat(this.state.selectedStudents);
    // students.push(student);
    // this.setState({selectedStudents: students});
  }

      /*  revisar https://github.com/alsoscotland/react-super-select  */
  render() {
    return (
      <div style={styles.container}>
        <Input
          type="text"
          value={this.state.name}
          placeholder="Ex: University of Neverland"
          label="Enter organization name"
          onChange={e => this.setState({ name: e.target.value })}
        />
        <Input
          type="text"
          value={this.state.mail}
          placeholder="Ex: billing@example.com"
          label="Enter billing mail"
          onChange={e => this.setState({ mail: e.target.value })}
        />
        <Input
          type="text"
          value={this.state.address}
          placeholder="Ex: Royal Avenue 53, Miami"
          label="Billing address"
          onChange={e => this.setState({ address: e.target.value })}
        />
        <Input
          type="text"
          value={this.state.contact}
          placeholder="Ex: 555-12341-123"
          label="Contact number"
          onChange={e => this.setState({ name: e.target.value })}
        />
        <ButtonToolbar label= "Suscription Plan">
          <Col xs={12} md={4}>
            <h1>hola</h1>
          </Col>
          <Col xs={10} md={4}>
            <DropdownButton title="Select Suscription Plan" id="dropdown-size-medium">
              <MenuItem eventKey="1">Plan Estudiante</MenuItem>
              <MenuItem eventKey="2">Plan Suscription 1</MenuItem>
              <MenuItem eventKey="3">Plan Suscription 2</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey="4">Separated link</MenuItem>
            </DropdownButton>
          </Col>
        </ButtonToolbar>


        <Button bsStyle="primary" bsSize="large" active>Create Organization</Button>

      </div>
    );
  }
}

const styles = {
  container: {

  },
};
