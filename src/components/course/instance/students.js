import React, { PropTypes, Component } from 'react';
import { Row, Col, Panel, Button, Table, ControlLabel, DropdownButton, MenuItem } from 'react-bootstrap';
import Select from 'react-select';
import Icon from 'react-fa';
import renderIf from 'render-if';

import app from '../../../app';
const participantService = app.service('/participants');
const organizationService = app.service('/organizations');
const userService = app.service('/users');


const ROLES = [
  { value: 'read', label: 'Student' },
  { value: 'write', label: 'Assistant' },
  { value: 'admin', label: 'Teacher' },
];

export default class InstanceStudents extends Component {

  static get propTypes() {
    return {
      instance: PropTypes.object,
      participant: PropTypes.object,
      membership: PropTypes.object,
      organization: PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      participant: {},
      membership: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      participants: [],
      loading: false,
      users: [],
      selected: [],
      role: ROLES[0].value,
      permission: '',
    };
    this.fetchUsers = this.fetchUsers.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.fetchParticipants = this.fetchParticipants.bind(this);
    this.fetchUsers = this.fetchUsers.bind(this);
  }

  componentDidMount() {
    const { organization, instance } = this.props;
    this.fetchUsers(organization);
    this.fetchParticipants(instance);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.instance && nextProps.instance.id !== this.props.instance.id) {
      this.fetchParticipants(nextProps.instance);
    }
  }

  onSubmit(e) {
    e.preventDefault();
    const newParticipant = this.state.selected.map(user => ({
      userId: user.id,
      instanceId: this.props.instance.id,
      permission: this.state.role,
    }));

    return Promise.all(newParticipant.map(p => participantService.create(p)))
      .then(() => this.setState({ selected: [], error: null }))
      .catch(error => this.setState({ error }));
  }

  onPermissionSelect(key, participant) {
    if (ROLES[key]) {
      // Role changed
      const permission = ROLES[key].value;
      return participantService.patch(participant.id, { permission });
    }
    // Removed
    return participantService.remove(participant.id);
  }

  fetchUsers(organization) {
    this.setState({ loading: true });
    const query = {
      id: organization.id || organization,
      $populate: ['user'],
      $limit: 1,
    };
    return organizationService.find({ query })
      .then(result => result.data[0])
      .then(org => this.setState({ users: org.users, loading: false, error: false }))
      .catch(error => this.setState({ error, loading: false }));
  }

  fetchParticipants(instance) {
    this.setState({ loading: true });

    const renew = (participant) => {
      const index = this.state.participants.findIndex(p => p.id === participant.id);
      if (index > -1) {
        const participants = [...this.state.participants];
        participants[index] = { ...participants[index], ...participant };
        this.setState({ participants });
      }
    };

    participantService.on('created', participant => {
      userService.get(participant.userId).then(user => {
        this.setState({ participants: [...this.state.participants, { ...participant, user }] });
      });
    });

    participantService.on('patched', renew);
    participantService.on('updated', renew);
    participantService.on('removed', participant => {
      const index = this.state.participants.findIndex(p => p.id === participant.id);
      if (index) {
        const participants = [...this.state.participants];
        participants.splice(index, 1);
        this.setState({ participants });
      }
    });

    const query = {
      instanceId: instance.id || instance,
      $populate: 'user',
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => this.setState({ participants, error: null, loading: false }))
      .catch(error => this.setState({ error, loading: false }));
  }

  render() {
    const { membership, participant } = this.props;

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

    const canEdit = ['admin', 'write'].includes(membership.permission) || ['admin'].includes(participant.permission);

    return (
      <div style={styles.container}>
        <Col xs={12} md={8}>
          {renderIf(canEdit)(() =>
            <div>
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
            </div>
        )}
          <Row>
            <Col xs={12}>
              <Table hover striped>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                {this.state.participants.map(partcpnt => (
                  <tr key={partcpnt.userId}>
                    <td style={styles.cell}>{partcpnt.user.name}</td>
                    <td>
                      {renderIf(canEdit)(() =>
                        <DropdownButton
                          id="participant-dropdown"
                          bsStyle="link"
                          title={permissions[partcpnt.permission]}
                          onSelect={key => this.onPermissionSelect(key, partcpnt)}
                        >
                          {ROLES.map((role, i) => (
                            <MenuItem key={i} eventKey={i} active={partcpnt.permission === role.value}>
                              {role.label}
                            </MenuItem>
                          ))}
                          <MenuItem divider />
                          <MenuItem bsStyle="danger" eventKey={ROLES.length}>
                            Remove
                          </MenuItem>
                        </DropdownButton>
                      )}
                      {renderIf(!canEdit)(() =>
                        <span>{permissions[partcpnt.permission]}</span>
                      )}
                    </td>
                  </tr>
                ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Col>
        <Col xs={12} md={4}>
          <Panel>
            <h5><Icon style={styles.icon} name="lightbulb-o" /> Students</h5>
            <hr />
            <p>Each participant has a specific role inside the course.</p>
            <hr />
            <p>Search participants and add a role to them on the course.</p>
          </Panel>
        </Col>
      </div>
    );
  }
}

const styles = {
  container: {

  },
  cell: {
    verticalAlign: 'middle',
  },
  icon: {
    marginRight: 7,
  },
};
