import React, { PropTypes, Component } from 'react';
import {
  Panel,
  Col,
  Button,
  Modal,
  FormControl,
  FormGroup,
} from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';

import RichEditor from '../../rich-editor';
import Announcement from '../../announcement';

import app, { currentUser } from '../../../app';
const announcementService = app.service('/announcements');


export default class InstanceEvaluations extends Component {

  static get propTypes() {
    return {
      organization: PropTypes.object,
      course: PropTypes.object,
      instance: PropTypes.object,
      announcements: PropTypes.array,
      participant: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      announcements: [],
      showModal: false,
      subject: '',
      content: null,
      loading: false,
      error: null,
    };
    this.onModalClose = this.onModalClose.bind(this);
    this.onModalSave = this.onModalSave.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.fetchAnnouncements = this.fetchAnnouncements.bind(this);
  }

  componentDidMount() {
    const instance = this.props.instance;
    this.fetchAnnouncements(instance);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.instance && nextProps.instance.id !== this.props.instance.id) {
      this.fetchAnnouncements(nextProps.instance);
    }
  }

  onModalClose(/* question */) {
    this.setState({ showModal: false });
  }

  onChangeContent(content) {
    this.setState({ content });
  }

  onModalSave() {
    if (window.confirm("Do you really want to proceed?")) {
      this.setState({ loading: true });

      const announcement = {
        subject: this.state.subject,
        content: this.state.content,
        userId: currentUser().id,
        instanceId: this.props.instance.id,
      };
      return announcementService.create(announcement)
        .then(() => this.fetchAnnouncements(this.props.instance))
        .then(() => this.setState({
          // Restore state for future announcements
          showModal: false,
          subject: '',
          content: null,
          // Restore other states
          loading: false,
          error: null,
        }))
        .catch(error => this.setState({ error, loading: false }));
    }
  }

  fetchAnnouncements(instance) {
    this.setState({ loading: true });

    const query = {
      instanceId: instance.id || instance,
      $populate: 'responsable',
      $sort: { createdAt: -1 },
    };
    return announcementService.find({ query })
      .then(result => result.data)
      .then(announcements => this.setState({ announcements }))
      .catch(error => this.setState({ error, loading: false }));
  }

  renderModal() {
    return (
      <Modal
        show={this.state.showModal}
        onHide={this.onModalClose}
        style={styles.modal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <form>
            <FormGroup>
              <FormControl
                type="text"
                value={this.state.subject}
                placeholder="Subject..."
                onChange={(e) => this.setState({ subject: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <br />
              <div style={styles.richEditorContainer}>
                <RichEditor
                  content={this.state.content}
                  onChange={this.onChangeContent}
                />
              </div>
            </FormGroup>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onModalClose}>Close</Button>
          <Button
            type="submit"
            bsStyle="primary"
            onClick={this.onModalSave}
          >
            Save and publish
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  render() {
    const participant = this.props.participant;
    const { announcements } = this.state;

    return (
      <div style={styles.container}>
        <Col xs={12} md={8}>
          {renderIf(announcements.length === 0)(() =>
            <h4>There is not published announcements</h4>
          )}
          {announcements.map((announcement, index) => {
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
          })}
        </Col>
        <Col xs={12} md={4}>
          <Panel>
            <h5><Icon style={styles.icon} name="lightbulb-o" />Announcements</h5>
            <hr />
            <p>
              Notify the classroom about important news or bulletins.
            </p>
            {renderIf(['admin', 'write'].includes(participant.permission))(() =>
              <div>
                <hr />
                <p>Create a new announcement:</p>
                <Button
                  bsStyle="primary"
                  bsSize="small"
                  onClick={() => this.setState({ showModal: !this.state.showModal })}
                >
                  <Icon style={styles.icon} name="plus" /> Create announcement
                </Button>
              </div>
            )}
          </Panel>
        </Col>
        {this.renderModal()}
      </div>
    );
  }
}

const styles = {
  container: {
  },
  cell: {
    marginLeft: 25,
  },
  icon: {
    marginRight: 7,
  },
  title: {
    marginBottom: 22,
  },
  text: {
    marginBottom: 3,
  },
  textArea: {
    backgroundColor: 'rgb(247,247,247)',
  },
  richEditor: {
    margin: 0,
    padding: 0,
    fontSize: 15,
  },
  richEditorContainer: {
    border: 1,
    borderColor: 'gray',
  },
  modalBody: {
    height: 500,
    paddingBottom: 200,
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
