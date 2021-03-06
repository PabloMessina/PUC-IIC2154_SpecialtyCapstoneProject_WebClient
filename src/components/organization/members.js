import React, { PropTypes, Component } from 'react';
import { Grid, Row, Col, Panel, Button, Table, ControlLabel, DropdownButton, MenuItem } from 'react-bootstrap';
import Select from 'react-select';
import moment from 'moment';
import renderIf from 'render-if';

import ErrorAlert from '../error-alert/';

import app from '../../app';
const membershipService = app.service('/memberships');
const userService = app.service('/users');

const ROLES = [
  { value: 'read', label: 'Member' },
  { value: 'write', label: 'Moderator' },
  { value: 'admin', label: 'Administrator' },
];

export default class CourseTab extends Component {

  static get propTypes() {
    return {
      organization: PropTypes.object,
      membership: PropTypes.object,
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
      role: ROLES[0].value,
      loading: false,
      error: null,
    };
    this.fetchUsers = this.fetchUsers.bind(this);
    this.observeMemberships = this.observeMemberships.bind(this);
    this.observe = this.observe.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    const { organization } = this.props;
    this.observe(organization);
    this.fetchUsers();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.organization && nextProps.organization.id !== this.props.organization.id) {
      this.observe(nextProps.organization);
    }
  }

  componentWillUnmount() {
    if (this.membershipObserver) this.membershipObserver.unsubscribe();
  }

  onPermissionSelect(key, user, membership) {
    if (ROLES[key]) {
      // Role changed
      const permission = ROLES[key].value;
      return membershipService.patch(membership.id, { permission })
        // feathers-reactive bug: Can't use 'catch' directly
        .then(result => result)
        .catch(error => this.setState({ error }));
    }
    // Removed
    return membershipService.remove(membership.id)
      // feathers-reactive bug: Can't use 'catch' directly
      .then(result => result)
      .catch(error => this.setState({ error }));
  }

  onSubmit(e) {
    e.preventDefault();
    const newMemberships = this.state.selected.map(user => ({
      userId: user.id,
      organizationId: this.props.organization.id,
      permission: this.state.role,
    }));

    return Promise.all(newMemberships.map(m => membershipService.create(m)))
      .then(() => this.setState({ selected: [] }))
      .catch(error => this.setState({ error }));
  }

  fetchUsers(query = {}) {
    this.setState({ loading: true });
    return userService.find({ query })
      .then(result => result.data)
      .then(users => this.setState({ users, loading: false }))
      .catch(error => this.setState({ error }));
  }

  observe(organization) {
    this.membershipObserver = this.observeMemberships(organization).subscribe(memberships => {
      this.setState({ memberships });
    });
  }

  observeMemberships(organization) {
    const query = {
      organizationId: organization.id || organization,
    };
    return membershipService.find({ query }).map(result => result.data);
  }

  render() {
    // TODO: filter from current selected list

    const { membership } = this.props;

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
    const permissions = {};
    ROLES.forEach(({ value, label }) => (permissions[value] = label));

    const canEdit = membership && ['admin', 'write'].includes(membership.permission);

    return (
      <Grid style={styles.container}>
        <Col xs={12} md={9}>
        {renderIf(canEdit)(() =>
          <Row>
            <form onSubmit={this.onSubmit}>
              <Col xs={7}>
                <ControlLabel>Names</ControlLabel>
                <Select
                  multi
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
            <hr />
          </Row>
      )}
          <Row>
            <Table hover striped>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Added at</th>
                </tr>
              </thead>
              <tbody>
              {this.state.memberships.map(({ user, ...membrshp }) => (
                <tr key={user.id}>
                  <td style={styles.cell}>{user.name}</td>
                  <td style={styles.cell}>
                    {renderIf(canEdit)(() =>
                      <DropdownButton
                        id="membership-dropdown"
                        bsStyle="link"
                        title={permissions[membrshp.permission]}
                        onSelect={key => this.onPermissionSelect(key, user, membrshp)}
                      >
                        {ROLES.map((role, i) => (
                          <MenuItem key={i} eventKey={i} active={membrshp.permission === role.value}>
                            {role.label}
                          </MenuItem>
                        ))}
                        <MenuItem divider />
                        <MenuItem eventKey={ROLES.length}>
                          Remove
                        </MenuItem>
                      </DropdownButton>
                    )}
                    {renderIf(!canEdit)(() =>
                      <span>{permissions[membrshp.permission]}</span>
                    )}
                  </td>
                  <td style={styles.cell}>{moment(membrshp.createdAt).format('LL')}</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          <Panel>
            <h4>Members</h4>
            <p>Each member has a specific role inside the organization.</p>
            <hr />
            <p>Search users and add a bulk of them to the organization.</p>
            <ErrorAlert
              error={this.state.error}
              onDismiss={() => this.setState({ error: null })}
            />
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
