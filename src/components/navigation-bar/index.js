import React, { Component } from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';
import Icon from 'react-fa';

import app, { logout } from '../../app';
const membershipService = app.service('/memberships');

export default class NavigationBar extends Component {

  static get propTypes() {
    return {
      title: React.PropTypes.node,
      user: React.PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      title: 'Title',
      user: null,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      memberships: [],
      error: null,
    };
    this.onLogout = this.onLogout.bind(this);
    this.fetchMemberships = this.fetchMemberships.bind(this);
    this.onDropdownClick = this.onDropdownClick.bind(this);
    this.renderRightNavigation = this.renderRightNavigation.bind(this);
    this.renderDropDown = this.renderDropDown.bind(this);
  }

  onDropdownClick() {
    return this.fetchMemberships();
  }

  onLogout() {
    return logout().then(() => browserHistory.push('/'));
  }

  fetchMemberships() {
    const user = this.props.user;
    if (user) {
      const query = {
        userId: user.id,
        $populate: 'organization',
      };
      return membershipService.find({ query })
        .then(result => result.data)
        .then(memberships => this.setState({ memberships, error: null }))
        .catch(error => this.setState({ error }));
    } else {
      return this.setState({ memberships: [], error: null });
    }
  }

  renderRightNavigation() {
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
              <Icon style={styles.icon} name="sign-out" /> Log out
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

  renderDropDown() {
    const memberships = this.state.memberships;
    const title = (
      <span><Icon style={styles.navIcon} name="users" /> Organizations</span>
    );
    return (
      <NavDropdown eventKey={2} title={title} id="organizations-dropdown" onClick={this.onDropdownClick}>
        {memberships.map((membership, i) => {
          const organization = membership.organization;
          const name = organization.name;
          const eventKey = 2 + i * 0.1;
          const url = `/organizations/show/${organization.id}`;
          return (
            <MenuItem key={i} eventKey={eventKey} onSelect={() => browserHistory.push(url)}>
              {name}
            </MenuItem>
          );
        })}
        {renderIf(memberships.length === 0)(() => (
          <MenuItem eventKey={2.1} disabled>None</MenuItem>
        ))}
        <MenuItem divider />
        <MenuItem eventKey={3} onSelect={() => browserHistory.push('/organizations/create')}>
          <Icon style={styles.icon} name="plus" /> Create organization
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

            {/*
            <Navbar.Form style={{ paddingTop: 3.5 }} pullLeft>
              <FormGroup bsSize="small">
                <FormControl type="text" placeholder="Search" />
              </FormGroup>
              {' '}
              <Button bsSize="small" type="submit">Submit</Button>
            </Navbar.Form>
            */}

            <NavItem eventKey={1} onClick={() => browserHistory.push('/documents')}>
              <Icon style={styles.navIcon} name="book" /> Atlases
            </NavItem>

            {this.renderDropDown()}

          </Nav>

          {this.renderRightNavigation()}

        </Navbar.Collapse>

      </Navbar>
    );
  }
}

const styles = {
  navbar: {
  },
  icon: {
    marginRight: 7,
  },
  navIcon: {
    marginRight: 3,
  },
};
