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
      email: '',
      password: '',
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    // Prevent page refresh
    e.preventDefault();
  }

  render() {
    return (
      <div style={styles.container}>
        <Grid>
          <Row>
            <Col md={6}>
              <h1>
                Crear Cuenta
              </h1>
              <p>Descripcion de la aplicación</p>
            </Col>
            <Col md={6}>
              <Panel>
                <form onSubmit={this.onSubmit}>
                  <Input type="text"
                    label="Nombre"
                    value={this.state.name}
                    onChange={e => this.setState({ name: e.target.value })}
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

};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
