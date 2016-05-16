import React, { PropTypes, Component } from 'react';
import { Row, Col, Panel, Button, Table, ControlLabel, DropdownButton, MenuItem } from 'react-bootstrap';
import Icon from 'react-fa';
import Select from 'react-select';
import { browserHistory } from 'react-router';

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
    };
    this.createAtlas = this.createAtlas.bind(this);
    this.fetch = this.fetch.bind(this);
  }

  componentDidMount() {
    this.fetch();
  }

  fetch() {
    return atlasService.find()
      .then(result => result.data)
      .then(atlases => this.setState({ atlases }));
  }

  createAtlas() {
    const url = `/organizations/show/${this.props.organization.id}/atlases/create`;
    return browserHistory.push(url);
  }

  render() {
    return (
      <div style={styles.container}>
        <Col xs={12} md={8}>
          <Row>
            <form onSubmit={this.onSubmit}>
              <Col xs={9}>
                <ControlLabel>Atlases</ControlLabel>
                <Select
                  multi
                  disabled={this.state.disabled}
                  placeholder="Atlases..."
                  onChange={(value, selected) => this.setState({ selected })}
                  isLoading={this.state.loading}
                  value={this.state.selected}
                />
              </Col>
              <Col xs={3}>
                <br />
                <Button bsStyle="primary" block type="submit">
                  Add
                </Button>
              </Col>
            </form>
          </Row>
          <hr />
        </Col>
        <Col xs={12} md={4}>
          <Panel>
            <h4>Bibliography</h4>
            <p>Every course can have it's own resources and atlases.</p>
            <hr />
            <p>Add an atlas to the course or create a new one:</p>
            <Button bsStyle="primary" bsSize="small" onClick={this.createAtlas}>
              <Icon style={styles.icon} name="plus" /> Create atlas
            </Button>
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
