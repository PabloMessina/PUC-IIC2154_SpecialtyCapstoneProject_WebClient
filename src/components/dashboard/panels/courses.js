import React, { Component, PropTypes } from 'react';
import { Panel, Image } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import renderIf from 'render-if';

import app, { currentUser } from '../../../app';
const participantService = app.service('/participants');
const instanceService = app.service('/instances');

import Title from './common/title';


class CoursesPanel extends Component {

  static get propTypes() {
    return {
      query: PropTypes.object,
      style: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      instances: [],
      total: null,
    };
    this.renderInstance = this.renderInstance.bind(this);
    this.fetchInstances = this.fetchInstances.bind(this);
  }

  componentDidMount() {
    this.fetchInstances(this.props.query);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.query !== this.props.query) {
      this.fetchInstances(nextProps.query);
    }
  }

  fetchInstances(custom) {
    let query = {
      userId: currentUser().id,
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => {
        query = {
          id: { $in: participants.map(participant => participant.instanceId) },
          $populate: 'course',
          $sort: { createdAt: -1 },
          ...custom,
        };
        return instanceService.find({ query });
      })
      .then(({ data, total }) => this.setState({ instances: data, total }));
  }

  renderInstance({ course, ...instance }) {
    const pathname = `/courses/show/${course.id}/instances/show/${instance.id}`;
    return (
      <LinkContainer key={instance.id} to={{ pathname }}>
        <a style={styles.cell}>
          <Image style={styles.logo} src="https://coursera-university-assets.s3.amazonaws.com/89/d0ddf06ad611e4b53d95ff03ce5aa7/360px.png" />
          <h6 style={styles.course}>
            {course.name}
            <br />
            <small>{instance.period}</small>
          </h6>
        </a>
      </LinkContainer>
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
