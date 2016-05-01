import React, { Component } from 'react';
import { Grid, Row, Col, Panel, Button, Table, ControlLabel, DropdownButton, MenuItem } from 'react-bootstrap';
import Select from 'react-select';

import app from '../../app';
const membershipService = app.service('/memberships');
const userService = app.service('/users');

const ROLES = [
  { value: 'read', label: 'Student' },
  { value: 'write', label: 'Teacher' },
  { value: 'admin', label: 'Administrator' },
];

export default class CourseTab extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      // Appear on the select box
      selected: [],
      // Local store
      users: [],
      // Current members
      memberships: [],
      // Other state values
      role: ROLES[0],
      loading: false,
      error: null,
    };
    this.fetchMemberships = this.fetchMemberships.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillMount() {
    this.fetchMemberships(this.props.organization.id);
    this.fetchUsers();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.organization) {
      this.fetchMemberships(nextProps.organization.id);
    }
  }

  onPermissionSelect(key, user, membership) {
    if (key < ROLES.length) {
      // Role changed
      const permission = ROLES[key].value;
      return membershipService.patch(membership.id, { permission });
    }
    // Removed
    return membershipService.remove(membership.id);
  }

  onSubmit(e) {
    e.preventDefault();
    const newMemberships = this.state.selected.map(user => ({
      userId: user.id,
      organizationId: this.props.organization.id,
      permission: this.state.role.value,
    }));

    return Promise.all(newMemberships.map(m => membershipService.create(m)))
      .then(() => this.setState({ selected: [] }))
      .catch(error => this.setState({ error }));
  }

  fetchUsers(query = {}) {
    this.setState({ loading: true });
    return userService.find({ query })
      .then(result => result.data)
      .then(users => this.setState({ users, loading: false }));
  }

  fetchMemberships(organizationId) {
    const query = {
      organizationId,
    };
    return membershipService.find({ query })
      .then(result => result.data)
      .then(memberships => this.setState({ memberships }));
  }

  render() {
    const ids = this.state.memberships.map(m => m.userId);
    const users = this.state.users.map(user => {
      const disabled = ids.indexOf(user.id) > -1;
      return {
        disabled,
        id: user.id,
        value: user.id,
        label: disabled ? `${user.name} (already selected)` : user.name,
      };
    });

    return (
      <Grid style={styles.container}>
        <Col xs={12} md={9}>
          <Row>
            <form onSubmit={this.onSubmit}>
              <Col xs={7}>
                <ControlLabel>Names</ControlLabel>
                <Select
                  multi
                  disabled={this.state.disabled}
                  value={this.state.selected}
                  options={users}
                  isLoading={this.state.loading}
                  placeholder="Member"
                  onChange={(value, selected) => this.setState({ selected })}
                />
              </Col>
              <Col xs={3}>
                <ControlLabel>Role</ControlLabel>
                <Select
                  value={this.state.role}
                  options={ROLES}
                  placeholder="Role"
                  onChange={role => this.setState({ role })}
                />
              </Col>
              <Col xs={2}>
                <br />
                <Button bsStyle="primary" block type="submit" disabled={this.state.selected.length === 0}>
                  Set
                </Button>
              </Col>
            </form>
          </Row>
          <hr />
          <Row>
            <Col xs={12}>
              <Table responsive hover striped>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Added at</th>
                  </tr>
                </thead>
                <tbody>
                {this.state.memberships.map(({ user, ...membership }) => (
                  <tr key={user.id}>
                    <th style={styles.cell}>{user.name}</th>
                    <th style={styles.cell}>
                      <DropdownButton
                        id="membership-dropdown"
                        bsStyle="link"
                        title={membership.permission}
                        onSelect={key => this.onPermissionSelect(key, user, membership)}
                      >
                        {ROLES.map((role, i) => (
                          <MenuItem key={i} eventKey={i} active={membership.permission === role.value}>
                            {role.label}
                          </MenuItem>
                        ))}
                        <MenuItem divider />
                        <MenuItem eventKey={ROLES.length}>
                          Remove
                        </MenuItem>
                      </DropdownButton>
                    </th>
                    <th style={styles.cell}>{membership.createdAt}</th>
                  </tr>
                ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          <Panel>
            <h4>Members</h4>
            <p>Each member has a specific role inside the organization.</p>
            <hr />
            <p>Search users and add a bulk of them to the organization.</p>
          </Panel>
        </Col>
      </Grid>
    );
  }
}
const styles = {
  container: {
  },
  cell: {
    verticalAlign: 'middle',
  },
};
