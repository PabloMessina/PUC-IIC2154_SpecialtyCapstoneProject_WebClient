import React, { Component } from 'react';
import { Grid, Col, Panel, Button, Table, ControlLabel, Row } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import Select from 'react-select';

import app from '../../app';
const courseService = app.service('/courses');

export default class CourseTab extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tableUsers: [],
      users: [],
      role: '',
      allMembers: [
        {
          name: 'Felipe Bobadilla',
          mail: 'bobadilla91@gmail.com',
          Membership: 'undefined',
        },
        {
          name: 'Patricio Lopez',
          mail: 'pato@gmail.com',
          Membership: 'undefined',
        },
        {
          name: 'Constanza Halabi',
          mail: 'coni@gmail.com',
          Membership: 'undefined',
        },
        {
          name: 'Droid',
          mail: 'droide@gmail.com',
          Membership: 'undefined',
        },
        {
          name: 'Matias',
          mail: 'matias@gmail.com',
          Membership: 'undefined',
        },
        {
          name: 'Vicente holi',
          mail: 'vicho@gmail.com',
          Membership: 'undefined',
        },
        {
          name: 'Diego Steing',
          mail: 'diego@gmail.com',
          Membership: 'undefined',
        },
        {
          name: 'Geri Mami',
          mail: 'Geri@gmail.com',
          Membership: 'undefined',
        },
      ],
    };
    this.createCourse = this.createCourse.bind(this);
    this.fetch = this.fetch.bind(this);
    this.fetch(this.props.organization.id);
    this.onSubmit = this.onSubmit.bind(this);
    this.adduser = this.adduser.bind(this);
    this.setShip = this.setShip.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.organization) {
      this.fetch(nextProps.organization.id);
    }
  }

  onSubmit(e) {
    e.preventDefault();
    const tableUsers = this.state.users.map((member) => (
      {
        name: member.label,
        mail: member.value,
        role: this.state.role,
      }
    ));
    this.setState({ tableUsers: [...this.state.tableUsers, ...tableUsers], users: [] });
  }

  setShip(value) {
    this.setState({ role: value });
  }

  adduser(value, label) {
    this.setState({ users: label });
  }

  fetch(organizationId) {
    const query = {
      organizationId,
    };
    return courseService.find({ query })
      .then(result => result.data)
      .then(courses => this.setState({ courses }));
  }

  createCourse() {
    const url = `/organizations/show/${this.props.organization.id}/members/create`;
    return browserHistory.push(url);
  }

  render() {
    const roles = [
      { value: 'read', label: 'Student' },
      { value: 'write', label: 'Teacher' },
      { value: 'admin', label: 'Administrator' },
    ];

    const options = this.state.allMembers
    .filter((user) => !this.state.tableUsers
    .find((item) => item.name === user.name))
    .map(member => (
      {
        value: member.mail,
        label: member.name,
      }));
    return (
      <Grid style={styles.container}>
        <form onSubmit={this.onSubmit}>
          <Row>
            <Col xs={5}>
              <ControlLabel style={styles.text2}>Name</ControlLabel>
              <Select
                multi
                simpleValue
                disabled={this.state.disabled}
                value={this.state.users}
                options={options}
                placeholder={'Members'}
                onChange={this.adduser}
              />
            </Col>
            <Col xs={3}>
              <ControlLabel style={styles.text}>New Role</ControlLabel>
              <Select
                simpleValue
                value={this.state.role}
                options={roles}
                onChange={this.setShip}
              />
              <br />
            </Col>
            <Col xs={1}>
              <br />
              <Button bsStyle="primary" type="submit" >
                Add
              </Button>
            </Col>
          </Row>
        </form>
        <Col xs={12} md={9}>
          <Table responsive hover striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
            {this.state.tableUsers.map((user, i) => (
              <tr>
                <th>{i + 1}</th>
                <th>{user.name}</th>
                <th>{user.mail}</th>
                <th>{user.role}</th>
              </tr>
            ))}
            </tbody>
          </Table>
        </Col>
        <Col xs={12} md={3}>
          <Panel>
            <h4>Members</h4>
            <p>Each member has a specific role inside the organization.</p>
            <hr />
            <p>Want to edit a member's role?</p>
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
