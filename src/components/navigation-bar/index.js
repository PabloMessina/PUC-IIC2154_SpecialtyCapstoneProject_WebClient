import React, { Component } from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';

import { logout } from '../../app';


export default class NavigationBar extends Component {

  static get defaultProps() {
    return {
      title: 'App',
      user: null,
    };
  }

  constructor(props) {
    super(props);
    this.onLogout = this.onLogout.bind(this);
  }

  onLogout() {
    return logout().then(() => browserHistory.push('/'));
  }

  rightNavigation() {
    if (this.props.user) {
      return (
        <Nav pullRight>
          <NavDropdown eventKey={1} title={this.props.user.name} id="basic-nav-dropdown">
            <MenuItem eventKey={1.1} onClick={() => browserHistory.push('/profile')}>
              Profile
            </MenuItem>
            <MenuItem eventKey={1.2} onClick={() => browserHistory.push('/settings')}>
              Settings
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={1.3} onClick={this.onLogout}>
              Log out
            </MenuItem>
          </NavDropdown>
        </Nav>
      );
    }
    return (
      <Nav pullRight>
        <NavItem eventKey={1} href="#" onClick={() => browserHistory.push('/login')}>
          Login
        </NavItem>
        <NavItem eventKey={2} href="#" onClick={() => browserHistory.push('/signup')}>
          Sign Up
        </NavItem>
      </Nav>
    );
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
            <NavItem eventKey={2} href="#" onClick={() => browserHistory.push('/organizations')}>
              Organizations
            </NavItem>
          </Nav>

          {this.rightNavigation()}

        </Navbar.Collapse>

      </Navbar>
    );
  }
}

NavigationBar.propTypes = {
  title: React.PropTypes.node,
  user: React.PropTypes.any,
};

const styles = {
  navbar: {
  },
};
