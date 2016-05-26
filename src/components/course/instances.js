import React, { Component } from 'react';
import { Row, Tabs, Tab } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';

import app, { currentUser } from '../../app';
const membershipService = app.service('/memberships');
const participantService = app.service('/participants');


class CourseInstances extends Component {

  static get propTypes() {
    return {
      // From parent
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      instances: React.PropTypes.array,
      // React Router
      params: React.PropTypes.object,
      location: React.PropTypes.object,
      children: React.PropTypes.any,
      router: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      membership: {},
      participants: [],
      error: null,
    };
    this.fetchMembership = this.fetchMembership.bind(this);
    this.fetchParticipants = this.fetchParticipants.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }

  componentDidMount() {
    this.fetchMembership(this.props.organization.id);
    this.fetchParticipants(this.props.instances.map(i => i.id));

    // If we are in a subrouter, do not redirect
    if (this.subpath) return;

    // Blank page, make a redirection
    const { course, instances } = this.props;
    this.timer = setTimeout(() => {
      if (instances.length) {
        this.props.router.replace(`/courses/show/${course.id}/instances/show/${instances[0].id}`);
      } else {
        this.props.router.replace(`/courses/show/${course.id}/instances/create`);
      }
    }, 200);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const { organization, instances } = nextProps.params;

    // Check if organization has changed
    if (organization && organization.id !== this.props.organization.id) {
      this.fetchMembership(organization.id);
    }
    // TODO: check if array is different
    if (instances && instances.length) {
      this.fetchParticipants(instances.map(i => i.id));
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onTabChange(selected) {
    // Sometimes is null and causes navigation bugs
    if (!selected || this.selected === selected) return;

    const courseId = this.props.course.id;
    if (selected === 'SETTINGS') {
      this.props.router.replace(`/courses/show/${courseId}/instances/settings`);
    } else if (selected === 'CREATE') {
      this.props.router.replace(`/courses/show/${courseId}/instances/create`);
    } else {
      this.props.router.replace(`/courses/show/${courseId}/instances/show/${selected}`);
    }
  }

  get selected() {
    const location = this.props.location.pathname.split('/').filter(Boolean);
    const [/* courses */, /* show */, /* :courseId*/, /* instances */, /* subpath */, selected] = location;
    return selected;
  }

  get subpath() {
    const location = this.props.location.pathname.split('/').filter(Boolean);
    const [/* courses */, /* show */, /* :courseId*/, /* instances */, subpath] = location;
    return subpath;
  }

  fetchMembership(organizationId) {
    const query = {
      organizationId,
      userId: currentUser().id,
      $limit: 1,
    };
    return membershipService.find({ query })
      .then(result => result.data[0])
      .then(membership => this.setState({ membership, error: null }))
      .catch(error => this.setState({ error }));
  }

  fetchParticipants(instancesId) {
    const query = {
      instanceId: { $in: instancesId },
      userId: currentUser().id,
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => this.setState({ participants, error: null }))
      .catch(error => this.setState({ error }));
  }

  renderSettingsIcon() {
    return <span><Icon style={styles.icon} name="cogs" /> Settings</span>;
  }

  render() {
    const { membership, participants } = this.state;
    const { organization, course } = this.props;
    const canEdit = ['admin', 'write'].includes(membership.permission);

    const instances = this.props.instances
      .filter(ins => canEdit || participants.findIndex(p => p.instanceId === ins.id) > -1);

    // Selected could be a instance or 'settings' or 'create'
    const selected = this.selected || this.subpath;
    // null if selected is 'settings' or 'create'
    const instance = instances.find(i => i.id === selected);
    const participant = instance ? participants.find(p => p.instanceId === instance.id) : null;
    // Pass this props to children
    const subprops = { organization, course, instance, instances, membership, participant };

    return (
      <div style={styles.container}>
        <Row>
          <Tabs
            style={styles.tabs}
            activeKey={selected}
            id="tabs"
            onSelect={this.onTabChange}
          >
            <Tab eventKey={0} disabled title="Instances" />
            {instances.map(ins => (
              <Tab key={ins.id} eventKey={ins.id} title={ins.period} />
            ))}
            {renderIf(canEdit)(() => [
              <Tab key="CREATE" eventKey="CREATE" title={<Icon name="plus" />} />,
              <Tab key="SETTINGS" eventKey="SETTINGS" title={this.renderSettingsIcon()} tabClassName="pull-right" />,
            ])}
          </Tabs>
        </Row>

        <br />

        {/* Render 'instance' child */}
        {renderIf(instance && this.props.children)(() =>
          <EasyTransition
            path={this.subpath}
            initialStyle={{ opacity: 0 }}
            transition="opacity 0.1s ease-in"
            finalStyle={{ opacity: 1 }}
          >
            {React.cloneElement(this.props.children, subprops)}
          </EasyTransition>
        )}

      </div>
    );
  }
}

export default withRouter(CourseInstances);

const styles = {
  container: {

  },
  icon: {
    marginRight: 7,
  },
};
