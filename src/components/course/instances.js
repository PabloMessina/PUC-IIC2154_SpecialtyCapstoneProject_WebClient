import React, { Component } from 'react';
import { Row, Tabs, Tab } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';
import { browserHistory } from 'react-router';

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
    if (selected) {
      const courseId = this.props.course.id;
      browserHistory.replace(`/courses/show/${courseId}/instances/${selected}`);
      this.setState({ selected });
    }
  }

  fetchInstances(courseId) {
    this.setState({ loading: true });
    const query = { courseId };

    return instanceService.find({ query })
      .then(result => result.data)
      .then(instances => {
        // Display first tab if none is selected
        let selected = this.state.selected;
        if (!selected && instances.length) {
          // Set first as selected
          selected = instances[0].id;
          this.onTabChange(selected);
        }
        return this.setState({ instances, loading: false });
      });
  }

  render() {
    const { organization, course } = this.props;
    const instance = this.state.instances.find(i => i.id === this.state.selected);

    const settings = (
      <span><Icon style={styles.icon} name="cogs" /> Settings</span>
    );

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
        {renderIf(this.props.children && instance)(() =>
          React.cloneElement(this.props.children, { organization, course, instance })
        )}

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
