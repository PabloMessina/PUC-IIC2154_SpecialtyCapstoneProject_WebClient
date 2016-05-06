import React, { Component } from 'react';
import { Row, Tabs, Tab } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';
import { browserHistory } from 'react-router';

import Instance from './instance/';

import app from '../../app';
const instanceService = app.service('/instances');


export default class CourseInstances extends Component {

  static get propTypes() {
    return {
      // React Router
      params: React.PropTypes.object,
      location: React.PropTypes.object,
      children: React.PropTypes.any,
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      instances: [],
      selected: null,
      loading: false,
    };
    this.fetchInstances = this.fetchInstances.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }

  componentDidMount() {
    // Fetch organization
    // const query = this.props.location.query;
    const course = this.props.course;
    this.fetchInstances(course.id);
  }

  onTabChange(selected) {
    // Sometimes is null and causes navigation bugs
    if (!selected) return;

    const courseId = this.props.course.id;
    if (selected === 2) {
      browserHistory.replace(`/courses/show/${courseId}/instances/settings`);
    } else {
      browserHistory.replace(`/courses/show/${courseId}/instances/show/${selected}`);
    }
    this.setState({ selected });
  }

  fetchInstances(courseId) {
    this.setState({ loading: true });
    const query = { courseId };

    return instanceService.find({ query })
      .then(result => result.data)
      .then(instances => {
        let selected = this.state.selected;
        if (!this.state.selected && instances.length) selected = instances[0].id;
        this.setState({ instances, selected, loading: false });
      });
  }

  render() {
    const { organization, course } = this.props;
    const { selected, instances } = this.state;
    const instance = instances.find(i => i.id === this.state.selected);

    const settings = (
      <span><Icon style={styles.icon} name="cogs" /> Settings</span>
    );

    const subprops = { organization, course, instance, instances };

    return (
      <div style={styles.container}>
        <Row>
          <Tabs
            style={styles.tabs}
            activeKey={this.state.selected}
            id="tabs"
            onSelect={this.onTabChange}
          >
            <Tab eventKey={0} disabled title="Instances" />
            {this.state.instances.map(ins => (
              <Tab key={ins.id} eventKey={ins.id} title={ins.period} />
            ))}
            <Tab eventKey={1} title={<Icon name="plus" />} />
            <Tab tabClassName="pull-right" eventKey={2} title={settings} />
          </Tabs>
        </Row>

        <br />

        {/* Render 'instance' child */}
        {renderIf(this.props.children && (instance || selected === 2))(() =>
          React.cloneElement(this.props.children, subprops)
        )}
        {renderIf(!this.props.children && instance && selected !== 2)(() => (
          <Instance {...subprops} />
        ))}

      </div>
    );
  }
}

const styles = {
  container: {

  },
  icon: {
    marginRight: 7,
  },
};
