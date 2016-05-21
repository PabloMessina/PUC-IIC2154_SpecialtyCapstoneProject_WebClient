import React, { Component } from 'react';
import { Row, Col, ListGroup, ListGroupItem, Panel } from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';
import renderIf from 'render-if';

const ELEMENTS = [
  {
    name: 'Announcements',
    icon: 'bullhorn',
    path: 'announcements',
  }, {
    name: 'Evaluations',
    icon: 'file-text-o ',
    path: 'evaluations',
  }, {
    name: 'Students',
    icon: 'users',
    path: 'students',
  }, {
    name: 'Analytics',
    icon: 'bar-chart ',
    path: 'analytics',
  }, {
    name: 'Bibliography',
    icon: 'book',
    path: 'bibliography',
  },
];

class Instance extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      instance: React.PropTypes.object,
      participant: React.PropTypes.object,
      membership: React.PropTypes.object,
      // React Router
      router: React.PropTypes.object,
      params: React.PropTypes.object,
      location: React.PropTypes.object,
      children: React.PropTypes.any,
    };
  }

  constructor(props) {
    super(props);
    this.state = {

    };
    this.renderListElement = this.renderListElement.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(element) {
    if (element.path !== this.selected) {
      const { course, instance } = this.props;
      const url = `/courses/show/${course.id}/instances/show/${instance.id}/${element.path}`;
      this.props.router.push(url);
    }
  }

  get selected() {
    const location = this.props.location.pathname.split('/').filter(Boolean);
    const [/* courses */, /* show */, /* :courseId*/, /* instances */, /* show */, /* :id */, selected] = location;
    return selected;
  }

  renderListElement(element, i) {
    return (
      <ListGroupItem key={i} active={element.path === this.selected} onClick={e => this.onSelect(element, e)}>
        <Icon style={styles.icon} name={element.icon} /> {element.name}
      </ListGroupItem>
    );
  }

  render() {
    const { organization, course, instance, participant, membership } = this.props;

    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12} sm={3} md={3}>
            <Panel style={styles.navigator} header={instance.period}>
              <ListGroup fill>
                {ELEMENTS.map((element, i) => this.renderListElement(element, i))}
              </ListGroup>
            </Panel>
          </Col>

          <Col xs={12} sm={9} md={9}>
            {renderIf(this.props.children && instance && participant)(() =>
              <EasyTransition
                path={this.selected}
                initialStyle={{ opacity: 0 }}
                transition="opacity 0.1s ease-in"
                finalStyle={{ opacity: 1 }}
              >
                {React.cloneElement(this.props.children, { organization, course, instance, participant, membership })}
              </EasyTransition>
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

export default withRouter(Instance);

const styles = {
  container: {

  },
  icon: {
    marginRight: 7,
  },
  navigator: {
    marginTop: 0,
  },
};
