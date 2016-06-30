import React, { Component, PropTypes } from 'react';
import {
} from 'react-bootstrap';
import renderIf from 'render-if';
import moment from 'moment';
import { Link } from 'react-router';

import app from '../../app';
const instanceService = app.service('/instances');

import RichEditor from '../rich-editor';

function formatDate(date) {
  return `${moment.utc(date).format('DD MMMM YYYY - hh:mm')}`;
}


export default class Announcement extends Component {

  static propTypes = {
    subject: PropTypes.string,
    content: PropTypes.object,
    responsable: PropTypes.string,
    date: PropTypes.any,
    instanceId: PropTypes.string,
  }

  static defaultProps = {
    responsable: '',
    instanceId: '',
  }

  state = {
    instance: null,
  }

  componentDidMount() {
    const { instanceId } = this.props;
    if (instanceId) this.fetchInstance(instanceId);
  }

  componentWillReceiveProps(nextProps) {
    const { instanceId } = nextProps;
    if (instanceId) this.fetchInstance(instanceId);
  }

  fetchInstance = (instanceId) => {
    const query = {
      id: instanceId,
      $populate: 'course',
      $limit: 1,
    };
    return instanceService.find({ query })
      .then(result => {
        const instance = result.data[0];
        this.setState({ instance });
      });
  }

  render() {
    const { subject, content, responsable, date, instanceId } = this.props;
    const { instance } = this.state;
    return (
      <div>
        {renderIf(instance && instance.course)(() =>
          <Link
            key={instance}
            style={styles.instance}
            to={`/courses/show/${instance.course.id}/instances/show/${instanceId}`}
          >
            <small>{instance.course.name} {instance.period} </small>
          </Link>
        )}
        <div style={styles.header}>
          <h5 style={styles.subject}>
            {subject}
            {renderIf(responsable)(() =>
              <small> by {responsable}</small>
            )}
          </h5>
          <p>{formatDate(date)}</p>
        </div>
        <div style={styles.editorContainer}>
          <RichEditor
            style={styles.richEditor}
            content={content}
            readOnly
          />
        </div>
      </div>
    );
  }
}

const styles = {
  richEditor: {
    padding: 0,
    fontSize: 15,
    overflow: 'auto',
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  instance: {

  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
