import React, { PropTypes, Component } from 'react';
import { Col, Panel, Button, Modal, ListGroup, ListGroupItem } from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import renderIf from 'render-if';

import AtlasGrid from '../../document-list/atlas-grid';

import app from '../../../app';
const biblographyService = app.service('/biblographies');
const atlasService = app.service('/atlases');


class CourseBibliography extends Component {
  static get propTypes() {
    return {
      organization: PropTypes.object,
      course: PropTypes.object,
      instance: PropTypes.object,
      participant: PropTypes.object,
      router: PropTypes.object,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      atlases: [],
      bibliographies: [],
      loading: false,
      error: null,
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
    const { organization, instance } = this.props;
    this.fetchAtlases(organization);
    this.fetchBibliographies(instance);
  }

  onAtlasCreate() {
    const url = `/organizations/show/${this.props.organization.id}/atlases/create`;
    return this.props.router.push(url);
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

  fetchAtlases(organization) {
    this.setState({ loading: true });
    const query = {
      organizationId: organization.id || organization,
    };
    return atlasService.find({ query })
      .then(result => result.data)
      .then(atlases => this.setState({ atlases, error: null, loading: false }))
      .catch(error => this.setState({ error, loading: false }));
  }

  fetchBibliographies(instance) {
    this.setState({ loading: true });
    const query = {
      instanceId: instance.id || instance,
      $populate: 'atlas',
    };
    return biblographyService.find({ query })
      .then(result => result.data)
      .then(bibliographies => this.setState({ bibliographies, error: null, loading: false }))
      .catch(error => this.setState({ error, loading: false }));
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
          {renderIf(bibliographies.length === 0)(() =>
            <h4>Empty bibliography</h4>
          )}
          <AtlasGrid atlases={bibliographies.map(bibliography => bibliography.atlas)} />
        </Col>

        <Col xs={12} md={4}>
          <Panel>
            <h5><Icon style={styles.icon} name="lightbulb-o" /> Bibliography</h5>
            <hr />
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

export default withRouter(CourseBibliography);
