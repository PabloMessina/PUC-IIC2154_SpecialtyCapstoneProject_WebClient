import React, { Component, PropTypes } from 'react';
import { Panel, Image } from 'react-bootstrap';
import renderIf from 'render-if';
import { Link } from 'react-router';
import Icon from 'react-fa';

import uniq from 'lodash/uniq';
import keyBy from 'lodash/keyBy';


import app, { currentUser } from '../../../app';
const participantService = app.service('/participants');
const instanceService = app.service('/instances');
const organizationService = app.service('/organizations');

import Title from './common/title';


class CoursesPanel extends Component {

  static get propTypes() {
    return {
      query: PropTypes.object,
      style: PropTypes.object,
    };
  }

  state = {
    organizations: {},
    instances: [],
    total: null,
  }

  componentDidMount() {
    this.fetchInstances(this.props.query);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.query !== this.props.query) {
      this.fetchInstances(nextProps.query);
    }
  }

  fetchInstances = async (custom) => {
    let query = {
      userId: currentUser().id,
    };
    const result = await participantService.find({ query });
    const participants = result.data;
    query = {
      id: { $in: participants.map(participant => participant.instanceId) },
      $populate: 'course',
      $sort: { createdAt: -1 },
      ...custom,
    };
    const { data, total } = await instanceService.find({ query });
    const instances = data;
    const organizationIds = uniq(instances.map(i => i.course.organizationId));
    const organizations = await this.fetchOrganizations(organizationIds);
    return this.setState({ instances, total, organizations: keyBy(organizations, 'id') });
  }

  fetchOrganizations = (organizationIds) => {
    const query = {
      id: { $in: organizationIds },
    };
    return organizationService.find({ query })
      .then(result => result.data);
  }

  renderInstance = ({ course, ...instance }) => {
    const organization = this.state.organizations[course.organizationId];
    const url = `/courses/show/${course.id}/instances/show/${instance.id}`;
    return (
      <Link key={instance.id} style={styles.cell} to={url}>
        {organization.logo ? (
          <Image style={styles.logo} src={organization.logo} />
        ) : (
          <Icon name="folder-open" size="4x" />
        )}
        <h6 style={styles.course}>
          {course.name}
          <br />
          <small>{instance.period}</small>
        </h6>
      </Link>
    );
  }

  render() {
    const { style } = this.props;
    const { instances } = this.state;
    return renderIf(instances.length)(() =>
      <Panel style={{ ...styles.container, ...style }}>
        <Title style={styles.title} title="Courses" />
        <hr />
        {instances.map(this.renderInstance)}
      </Panel>
    );
  }
}

export default CoursesPanel;

const styles = {
  container: {

  },
  title: {
    textAlign: 'center',
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 25,
    textDecoration: 'none',
  },
  logo: {
    objectFit: 'contain',
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  button: {

  },
  course: {
    margin: 0,
  },
  period: {
    margin: 5,
  },
};
