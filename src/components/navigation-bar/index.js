import React, { Component } from 'react';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';


export default class NavigationBar extends Component {

  static get defaultProps() {
    return {
      title: 'App',
    };
  }

  render() {
    return (
      <Navbar style={styles.navbar}>

        <Navbar.Header>
          <Navbar.Brand>
            <a href="#" onClick={() => browserHistory.push('/')}>{this.props.title}</a>
          </Navbar.Brand>
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav>
            <NavItem eventKey={1} onClick={() => browserHistory.push('/documents')}>
              Documentos
            </NavItem>
            <NavItem eventKey={2} onClick={() => browserHistory.push('/settings')}>
              Configuración
            </NavItem>
          </Nav>
          <Nav pullRight>
            <NavItem eventKey={1} href="#" onClick={() => browserHistory.push('/login')}>
              Ingresa
            </NavItem>
            <NavItem eventKey={2} href="#" onClick={() => browserHistory.push('/join')}>
              Registrate
            </NavItem>
          </Nav>
        </Navbar.Collapse>

      </Navbar>
    );
  }
}

NavigationBar.propTypes = {
  title: React.PropTypes.node,
};

const styles = {
  navbar: {
  },
};
