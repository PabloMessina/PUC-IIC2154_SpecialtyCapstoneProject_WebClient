import React, { Component } from 'react';
import { Panel, Input, Grid, Row, Col, ButtonInput } from 'react-bootstrap';
/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class Join extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      lastname: '',
      email: '',
      pass: '',
      pass1: '',
      location: '',
      gender: '',
      code: '',
    };
  }

  render() {
    return (
      <div style={styles.container}>
        <h1>
          Crear Cuenta
        </h1>
        <Grid>
          <Row>
            <Col md={6}>
              <p>Descripcion de la aplicación</p>
            </Col>
            <Col md={6}>
              <Panel>
                <form>
                  <Input type="text"
                    label="Nombre"
                    value={this.state.name}
                    onChange={e => this.setState({ name: e.target.value })}
                  />
                  <Input type="text"
                    label="Apellido"
                    value={this.state.lastname}
                    onChange={e => this.setState({ lastname: e.target.value })}
                  />
                  <Input type="email"
                    label="Email"
                    value={this.state.email}
                    onChange={e => this.setState({ email: e.target.value })}
                  />
                  <Input type="password"
                    label="Clave"
                    value={this.state.pass}
                    onChange={e => this.setState({ pass: e.target.value })}
                  />
                  <Input type="password"
                    label="Repetir Clave"
                    value={this.state.pass1}
                    onChange={e => this.setState({ pass1: e.target.value })}
                  />
                  <Input type="select"
                    label="Ubicación"
                    value={this.state.location}
                    onChange={e => this.setState({ location: e.target.value })}
                  >
                    <option>Chile</option>
                    <option>Otro</option>
                  </Input>
                  <Input type="select"
                    label="Genero"
                    onChange={e => this.setState({ gender: e.target.value })}
                  >
                    <option value={this.state.gender}>Hombre</option>
                    <option value={this.state.gender}>Mujer</option>
                  </Input>
                  <Input type="text"
                    label="Código Verificador"
                    value={this.state.code}
                    onChange={e => this.setState({ code: e.target.value })}
                  />
                  <ButtonInput bsStyle="primary" type="submit" value="Siguiente" />
                </form>
              </Panel>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
Join.propTypes = {
  message: React.PropTypes.string,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
