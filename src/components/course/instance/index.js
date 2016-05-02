import React, { Component } from 'react';
import { Row, Col, ListGroup, ListGroupItem, Panel } from 'react-bootstrap';
import Icon from 'react-fa';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

const ELEMENTS = [
  {
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
  },
];

export default class Instance extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      instance: React.PropTypes.object,
      // React Router
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
  }

  renderListElement(element, i) {
    const { course, instance } = this.props;
    const url = `/courses/show/${course.id}/instances/${instance.id}/${element.path}`;
    return (
      <ListGroupItem key={i} onClick={() => browserHistory.push(url)}>
        <Icon style={styles.icon} name={element.icon} /> {element.name}
      </ListGroupItem>
    );
  }

  render() {
    const { organization, course, instance } = this.props;
    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12} sm={3} md={3}>
            <Panel header={instance.period}>
              <ListGroup fill>
                {ELEMENTS.map((element, i) => this.renderListElement(element, i))}
              </ListGroup>
            </Panel>
          </Col>

          <Col xs={12} sm={9} md={9}>
            {renderIf(this.props.children && instance)(() =>
              React.cloneElement(this.props.children, { organization, course, instance })
            )}
          </Col>
        </Row>
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
