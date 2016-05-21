import React, { Component, PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import renderIf from 'render-if';

import app, { currentUser } from '../../../app';
const announcementService = app.service('/announcements');
const participantService = app.service('/participants');

import Announcement from '../../announcement';
import Title from './common/title';


class AnnouncementsPanel extends Component {

  static get propTypes() {
    return {
      query: PropTypes.object,
      style: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      announcements: [],
      total: null,
    };
    this.renderAnnouncement = this.renderAnnouncement.bind(this);
    this.fetchAnnouncements = this.fetchAnnouncements.bind(this);
  }

  componentDidMount() {
    this.fetchAnnouncements(this.props.query);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.query !== this.props.query) {
      this.fetchAnnouncements(nextProps.query);
    }
  }

  fetchAnnouncements(custom) {
    let query = {
      userId: currentUser().id,
    };
    return participantService.find({ query })
      .then(result => result.data)
      .then(participants => {
        query = {
          instanceId: { $in: participants.map(participant => participant.instanceId) },
          $populate: ['instance', 'user'],
          $sort: { createdAt: -1 },
          ...custom,
        };
        return announcementService.find({ query });
      })
      .then(({ data, total }) => this.setState({ announcements: data, total }));
  }

  renderAnnouncement({ user, instance, ...announcement }) {
    return (
      <div key={announcement.id}>
        <hr />
        <p>{user.name}</p>
        <p>{instance.period}</p>
        {/* <p>{announcement.content}</p> */}
      </div>
    );
  }

  render() {
    const { style } = this.props;
    const { announcements, total } = this.state;
    return (
      <Panel style={{ ...styles.container, ...style }}>
        <Title title="Announcements" detail="Do not miss important news" icon="newspaper-o" count={total} />
        <hr />
        {renderIf(announcements.length)(() =>
          announcements.map((announcement, index) => {
            const props = {
              content: announcement.content,
              subject: announcement.subject,
              date: announcement.createdAt,
              responsable: announcement.responsable ? announcement.responsable.name : '',
            };
            return (
              <div key={index}>
                {renderIf(index > 0)(
                  <hr />
                )}
                <Announcement {...props} />
              </div>
            );
          })
        )}
        {renderIf(announcements.length === 0)(() =>
          <div>
            <hr />
            <p>Nothing to show here</p>
          </div>
        )}
      </Panel>
    );
  }
}

export default AnnouncementsPanel;

const styles = {
  container: {

  },
};
