import React, { PropTypes, Component } from 'react';
import { Col, Panel, Button, Modal, ListGroup, ListGroupItem } from 'react-bootstrap';
import Icon from 'react-fa';
import { browserHistory } from 'react-router';
import AtlasGrid from '../../document-list/atlas-grid';

import renderIf from 'render-if';
import app from '../../../app';
const biblographyService = app.service('/biblographies');
const atlasService = app.service('/atlases');


export default class CourseBibliography extends Component {
  static get propTypes() {
    return {
      organization: PropTypes.object,
      course: PropTypes.object,
      instance: PropTypes.object,
      participant: PropTypes.object,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      atlases: [],
      bibliographies: [],
    };
    this.onAtlasCreate = this.onAtlasCreate.bind(this);
    this.onAtlasSelect = this.onAtlasSelect.bind(this);
    this.fetchAtlases = this.fetchAtlases.bind(this);
    this.fetchBibliographies = this.fetchBibliographies.bind(this);
    this.renderAtlasList = this.renderAtlasList.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  componentDidMount() {
    this.fetchAtlases(this.props.organization.id);
    this.fetchBibliographies(this.props.instance.id);
  }

  onAtlasCreate() {
    const url = `/organizations/show/${this.props.organization.id}/atlases/create`;
    return browserHistory.push(url);
  }

  onAtlasSelect(atlas) {
    biblographyService.create({
      atlasId: atlas.id,
      instanceId: this.props.instance.id,
    }).then((bibliography) => {
      const bibliographies = [...this.state.bibliographies, { ...bibliography, atlas }];
      this.setState({ bibliographies, error: null });
    }).catch(error => this.setState({ error }));
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  fetchAtlases(organizationId) {
    const query = {
      organizationId,
    };
    return atlasService.find({ query })
    .then(result => result.data)
    .then(atlases => this.setState({ atlases }));
  }

  fetchBibliographies(instanceId) {
    const query = {
      instanceId,
      $populate: 'atlas',
    };
    return biblographyService.find({ query })
      .then(result => result.data)
      .then(bibliographies => this.setState({ bibliographies }));
  }

  renderAtlasList(element, i) {
    return (
      <ListGroupItem key={i} onClick={() => this.onAtlasSelect(element)}>{element.title}</ListGroupItem>
    );
  }

  render() {
    const bibliographies = this.state.bibliographies;
    const participant = this.props.participant;
    const atlases = this.state.atlases
      .filter(atlas => bibliographies.findIndex(b => b.atlasId === atlas.id) === -1);

    return (
      <div style={styles.container}>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Add atlas to course</Modal.Title>
          </Modal.Header>
          <br />
          <ListGroup>
            {atlases.map((element, i) => this.renderAtlasList(element, i))}
          </ListGroup>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Col xs={12} md={8}>
          <AtlasGrid atlases={bibliographies.map(bibliography => bibliography.atlas)} />
        </Col>
        <Col xs={12} md={4}>
          <Panel>
            <h4>Bibliography</h4>
            <p>Every course can have it's own resources and atlases.</p>
            {renderIf(['admin', 'write'].includes(participant.permission))(() =>
              <div>
                <hr />
                <p>You can create a new atlas to add to the course:</p>
                <Button bsStyle="primary" bsSize="small" onClick={this.onAtlasCreate}>
                  <Icon style={styles.icon} name="plus" /> Create atlas
                </Button>
                <hr />
                <p>You can also add an existing atlas to the course:</p>
                <Button bsStyle="primary" bsSize="small" onClick={this.open}>
                  <Icon style={styles.icon} name="plus" /> Add atlas
                </Button>
              </div>
          )}
          </Panel>
        </Col>
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
