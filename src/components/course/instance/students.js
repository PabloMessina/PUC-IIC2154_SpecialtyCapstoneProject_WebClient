import React, { Component } from 'react';
import { Grid, Row, Col, Panel, Button, Table, ControlLabel, DropdownButton, MenuItem } from 'react-bootstrap';
import Select from 'react-select';

import app from '../../../app';
const participantService = app.service('/participants');
const userService = app.service('/users');

const ROLES = [
  { value: 'read', label: 'Student' },
  { value: 'write', label: 'Teacher' },
];

export default class InstanceStudents extends Component {
  static get propTypes() {
    return {
      instance: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      participants: [],
      loading: false,
      users: [],
      selected: [],
      role: ROLES[0],
    };
    this.fetchUsers = this.fetchUsers.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.fetchParticipants = this.fetchParticipants.bind(this);
  }

  componentDidMount() {
    this.fetchUsers();
    this.fetchParticipants();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.instance) {
      this.fetchParticipants(nextProps.instance.id);
    }
  }

  onSubmit(e) {
    e.preventDefault();
    console.log(this.state.selected);
    const newParticipant = this.state.selected.map(user => ({
      userId: user.id,
      permission: this.state.role.value,
    }));
    this.setState({ participants: newParticipant });
    this.setState({ selected: [] });
  }

  onPermissionSelect(key, participant) {
    if (key < ROLES.length) {
      // Role changed
      const permission = ROLES[key].value;
      return participantService.patch(participant.id, { permission });
    }
    // Removed
    return participantService.remove(participant.id);
  }

  fetchUsers() {
    this.setState({ loading: true });
    return userService.find()
    .then(result => result.data)
    .then(users => this.setState({ users, loading: false }));
  }

  fetchParticipants() {
    const query = {
      instanceId: this.props.instance.id,
      $populate: 'user',
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => this.setState({ participants }));
  }

  render() {
    const ids = this.state.participants.map(m => m.userId);
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
    return (
      <Grid style={styles.container}>
        <Col xs={12} md={6}>
          <Row>
            <form onSubmit={this.onSubmit}>
              <Col xs={7}>
                <ControlLabel>Names</ControlLabel>
                <Select
                  multi
                  options={users}
                  disabled={this.state.disabled}
                  placeholder="Participants..."
                  onChange={(value, selected) => this.setState({ selected })}
                  isLoading={this.state.loading}
                  value={this.state.selected}
                />
              </Col>
              <Col xs={3}>
                <ControlLabel>Role</ControlLabel>
                <Select
                  options={ROLES}
                  placeholder="Role..."
                  onChange={role => this.setState({ role })}
                  value={this.state.role}
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
                {this.state.participants.map(participant => (
                  <tr key={participant.id}>
                    <td>{participant.user.name}</td>
                    <td>
                      <DropdownButton
                        id="participant-dropdown"
                        bsStyle="link"
                        title={permissions[participant.permission]}
                        onSelect={key => this.onPermissionSelect(key, participant)}
                      >
                        {ROLES.map((role) => (
                          <MenuItem>
                            {role.label}
                          </MenuItem>
                        ))}
                        <MenuItem divider />
                        <MenuItem>
                          Remove
                        </MenuItem>
                      </DropdownButton>
                    </td>
                    <td>{participant.user.name}</td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={3}>
          <Panel>
            <h4>Participants</h4>
            <p>Each participant has a specific role inside the course.</p>
            <hr />
            <p>Search participants and add a role to them on the course.</p>
          </Panel>
        </Col>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
};
