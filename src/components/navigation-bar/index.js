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
              Atlases
            </NavItem>
            <NavItem eventKey={2} href="#" onClick={() => browserHistory.push('/courses')}>
              Courses
            </NavItem>
            <NavItem eventKey={3} onClick={() => browserHistory.push('/settings')}>
              Configuración
            </NavItem>
          </Nav>
          <Nav pullRight>
            <NavItem eventKey={1} href="#" onClick={() => browserHistory.push('/login')}>
              Login
            </NavItem>
            <NavItem eventKey={2} href="#" onClick={() => browserHistory.push('/signup')}>
              Sign Up
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
