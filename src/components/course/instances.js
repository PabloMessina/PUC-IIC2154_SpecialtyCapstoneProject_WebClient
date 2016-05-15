import React, { Component } from 'react';
import { Row, Tabs, Tab } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';


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
    this.onTabChange = this.onTabChange.bind(this);
  }

  componentDidMount() {
    if (this.subpath) return;

    const { course, instances } = this.props;
    this.timer = setTimeout(() => {
      if (instances.length) {
        this.props.router.replace(`/courses/show/${course.id}/instances/show/${instances[0].id}`);
      } else {
        this.props.router.replace(`/courses/show/${course.id}/instances/create`);
      }
    }, 200);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onTabChange(selected) {
    // Sometimes is null and causes navigation bugs
    if (!selected || this.selected === selected) return;

    const courseId = this.props.course.id;
    if (selected === 'settings') {
      this.props.router.replace(`/courses/show/${courseId}/instances/settings`);
    } else if (selected === 'create') {
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

  renderSettingsIcon() {
    return <span><Icon style={styles.icon} name="cogs" /> Settings</span>;
  }

  render() {
    const { organization, course, instances } = this.props;
    // Selected could be a instance or 'settings' or 'create'
    const selected = this.selected || this.subpath;
    // null if selected is 'settings' or 'create'
    const instance = instances.find(i => i.id === selected);
    // Pass this props to children
    const subprops = { organization, course, instance, instances };

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
            <Tab eventKey="create" title={<Icon name="plus" />} />
            <Tab eventKey="settings" title={this.renderSettingsIcon()} tabClassName="pull-right" />
          </Tabs>
        </Row>

        <br />

        {/* Render 'instance' child */}
        {renderIf(this.props.children)(() =>
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
