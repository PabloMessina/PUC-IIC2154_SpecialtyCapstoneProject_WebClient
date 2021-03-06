import React, { PropTypes, Component } from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Pulse } from 'better-react-spinkit';
import renderIf from 'render-if';
import Icon from 'react-fa';

import app, { logout } from '../../app';
const membershipService = app.service('/memberships');

import { Colors } from '../../styles';

class NavigationBar extends Component {

  static get propTypes() {
    return {
      title: PropTypes.node,
      user: PropTypes.any,
      connected: PropTypes.bool,
      animated: PropTypes.bool,
      router: PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      title: 'Title',
      user: null,
      connected: false,
      animated: false,
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
    return logout().then(() => this.props.router.push('/login'));
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
    const { user, connected, animated } = this.props;

    const color = connected ? Colors.MAIN : Colors.RED;
    const tooltip = <Tooltip id="status-tooltip">{connected ? 'Connected' : 'Reconnecting...'}</Tooltip>;
    const connection = (
      <OverlayTrigger placement="left" overlay={tooltip}>
        {animated
          ? <Pulse size={18} color={color} />
          : <Icon style={{ color }} name="circle" />}
      </OverlayTrigger>
    );

    if (user) {
      return (
        <Nav pullRight>
          <Navbar.Text eventKey={0}>
            {connection}
          </Navbar.Text>
          <NavDropdown eventKey={1} title={user.name} id="basic-nav-dropdown">
            <MenuItem eventKey={1.1} onClick={() => this.props.router.push('/profile')}>
              Profile
            </MenuItem>
            <MenuItem eventKey={1.2} onClick={() => this.props.router.push('/settings')}>
              Settings
            </MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={1.3} onClick={this.onLogout}>
              <Icon style={styles.icon} name="sign-out" /> Log out
            </MenuItem>
          </NavDropdown>
        </Nav>
      );
    } else {
      return (
        <Nav pullRight activeKey={2}>
          <Navbar.Text eventKey={0}>
            {connection}
          </Navbar.Text>
          <LinkContainer to="/login">
            <NavItem eventKey={1}>Login</NavItem>
          </LinkContainer>
          <LinkContainer to="/signup">
            <NavItem eventKey={1}>Sign Up</NavItem>
          </LinkContainer>
        </Nav>
      );
    }
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
            <MenuItem key={i} eventKey={eventKey} onSelect={() => this.props.router.push(url)}>
              {name}
            </MenuItem>
          );
        })}
        {renderIf(memberships.length === 0)(() => (
          <MenuItem eventKey={2.1} disabled>None</MenuItem>
        ))}
        <MenuItem divider />
        <MenuItem eventKey={3} onSelect={() => this.props.router.push('/organizations/create')}>
          <Icon style={styles.icon} name="plus" /> Create organization
        </MenuItem>
      </NavDropdown>
    );
  }

  render() {
    const { user, title, ...props } = this.props;

    return (
      <Navbar style={styles.navbar} {...props}>

        <Navbar.Header>
          <LinkContainer to="/" style={{ cursor: 'pointer' }}>
            <Navbar.Brand eventKey={1}>{title}</Navbar.Brand>
          </LinkContainer>
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
            {renderIf(user)(() =>
              <NavItem eventKey={1} onClick={() => this.props.router.push('/documents')}>
                <Icon style={styles.navIcon} name="book" /> Atlases
              </NavItem>
            )}
            {renderIf(user)(() => this.renderDropDown())}

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

export default withRouter(NavigationBar);
