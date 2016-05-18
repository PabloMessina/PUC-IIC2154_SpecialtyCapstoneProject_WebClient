import React, { PropTypes, Component } from 'react';
import { Row, Col, Panel, Button, Modal, ListGroup, ListGroupItem } from 'react-bootstrap';
import Icon from 'react-fa';
import { browserHistory } from 'react-router';
import AtlasGrid from '../../document-list/atlas-grid';

import app from '../../../app';
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
      bibliography: [],
    };
    this.createAtlas = this.createAtlas.bind(this);
    this.fetch = this.fetch.bind(this);
    this.renderAtlasList = this.renderAtlasList.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.addAtlas = this.addAtlas.bind(this);
  }

  componentDidMount() {
    this.fetch();
  }

  fetch(organizationId) {
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

  addAtlas(element) {
    this.state.bibliography.push(element);
  }

  renderAtlasList(element, i) {
    return (
      <ListGroupItem key={i} onClick={this.addAtlas(element[i])}>{element.title}</ListGroupItem>
    );
  }

  render() {
    return (
      <div style={styles.container}>
        <Row>
          <Col md={8}>
            <Panel>
              <h4>Course Atlases:</h4>
              <AtlasGrid atlases={this.state.atlases} />
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
                  {this.state.atlases.map((element, i) => this.renderAtlasList(element, i))}
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
