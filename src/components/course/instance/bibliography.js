import React, { PropTypes, Component } from 'react';
import { Row, Col, Panel, Button, Modal, ListGroup, ListGroupItem } from 'react-bootstrap';
import Icon from 'react-fa';
import { browserHistory } from 'react-router';
import AtlasGrid from '../../document-list/atlas-grid';

import app from '../../../app';
const biblographyService = app.service('/biblographies');
const atlasService = app.service('/atlases');


export default class CourseBibliography extends Component {
  static get propTypes() {
    return {
      organization: PropTypes.object,
      course: PropTypes.object,
      instance: PropTypes.object,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      atlases: [],
      bibliographies: [],
    };
    this.createAtlas = this.createAtlas.bind(this);
    this.fetchAtlases = this.fetchAtlases.bind(this);
    this.fetchBibliographies = this.fetchBibliographies.bind(this);
    this.renderAtlasList = this.renderAtlasList.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.onAtlasSelect = this.onAtlasSelect.bind(this);
  }

  componentDidMount() {
    this.fetchAtlases(this.props.organization.id);
    this.fetchBibliographies(this.props.instance.id);
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

  fetchAtlases(organizationId) {
    const query = {
      organizationId,
    };
    return atlasService.find({ query })
      .then(result => result.data)
      .then(atlases => this.setState({ atlases }));
  }

  createAtlas() {
    const url = `/organizations/show/${this.props.organization.id}/atlases/create`;
    return browserHistory.push(url);
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  onAtlasSelect(element) {
    biblographyService.create({
      atlasId: element.id,
      instanceId: this.props.instance.id,
    }).then((bibliography) => {
      bibliography.atlas = element;
      const bibliographies = [...this.state.bibliographies, bibliography];
      this.setState({ bibliographies, error: null });
    }).catch(error => this.setState({ error }));
  }

  renderAtlasList(element, i) {
    return (
      <ListGroupItem key={i} onClick={() => this.onAtlasSelect(element)}>{element.title}</ListGroupItem>
    );
  }

  render() {
    const bibliographies = this.state.bibliographies;
    const atlases = this.state.atlases
      .filter(atlas => bibliographies.findIndex(b => b.atlasId === atlas.id) === -1);

    return (
      <div style={styles.container}>
        <Row>
          <Col md={8}>
            <Panel>
              <h4>Course Atlases:</h4>
              <AtlasGrid atlases={bibliographies.map(bibliography => bibliography.atlas)} />
            </Panel>
          </Col>
          <Col md={4}>
            <Panel>
              <h4>Bibliography</h4>
              <p>Every course can have it's own resources and atlases.</p>
              <hr />
              <p>You can create a new atlas to add to the course:</p>
              <Button bsStyle="primary" bsSize="small" onClick={this.createAtlas}>
                <Icon style={styles.icon} name="plus" /> Create atlas
              </Button>
              <hr />
              <p>You can also add an existing atlas to the course:</p>
              <Button bsStyle="primary" bsSize="small" onClick={this.open}>
                <Icon style={styles.icon} name="plus" /> Add atlas
              </Button>

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

            </Panel>
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
