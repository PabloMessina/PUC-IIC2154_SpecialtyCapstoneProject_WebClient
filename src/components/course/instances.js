import React, { Component } from 'react';
import { Row, Tabs, Tab } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';
import { withRouter } from 'react-router';


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

  renderSettingsIcon() {
    return <span><Icon style={styles.icon} name="cogs" /> Settings</span>;
  }

  render() {
    const { organization, course, instances } = this.props;
    const selected = this.selected;
    const instance = instances.find(i => i.id === selected);

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
            <Tab eventKey="CREATE" title={<Icon name="plus" />} />
            <Tab eventKey="SETTINGS" title={this.renderSettingsIcon()} tabClassName="pull-right" />
          </Tabs>
        </Row>

        <br />

        {/* Render 'instance' child */}
        {renderIf(this.props.children)(() =>
          React.cloneElement(this.props.children, subprops)
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
