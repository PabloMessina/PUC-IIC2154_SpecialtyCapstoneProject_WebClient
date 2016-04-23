import React, { Component } from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import { logout } from '../../app';


export default class NavigationBar extends Component {

  static get defaultProps() {
    return {
      title: 'Title',
      user: null,
      organizations: [],
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
      <Nav pullRight activeKey={2}>
        <NavItem eventKey={1} href="#" onClick={() => browserHistory.push('/login')}>
          Login
        </NavItem>
        <NavItem eventKey={2} href="#" onClick={() => browserHistory.push('/signup')}>
          Sign Up
        </NavItem>
      </Nav>
    );
  }

  organizationsDropdown() {
    return (
      <NavDropdown eventKey={2} title="Organizations" id="organizations-dropdown">
        {this.props.organizations.map((organization, i) => {
          const name = organization.name;
          const eventKey = 2 + i * 0.1;
          const url = `/organizations/show/${organization.id}`;
          return (
            <MenuItem key={i} eventKey={eventKey} onSelect={() => browserHistory.push(url)}>
              {name}
            </MenuItem>
          );
        })}
        {renderIf(this.props.organizations.length === 0)(() => (
          <MenuItem eventKey={2.1} disabled>None</MenuItem>
        ))}
        <MenuItem divider />
        <MenuItem eventKey={3} onSelect={() => browserHistory.push('/organizations/create')}>
          <Glyphicon glyph="plus" /> Create organization
        </MenuItem>
      </NavDropdown>
    );
  }

  render() {
    const { title, ...props } = this.props;

    return (
      <Navbar style={styles.navbar} {...props}>

        <Navbar.Header>
          <Navbar.Brand>
            <a href="#" onClick={() => browserHistory.push('/')}>{title}</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav>

            <NavItem eventKey={1} onClick={() => browserHistory.push('/documents')}>
              Atlases
            </NavItem>

            {this.organizationsDropdown()}

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
  organizations: React.PropTypes.array,
};

const styles = {
  navbar: {
  },
};
