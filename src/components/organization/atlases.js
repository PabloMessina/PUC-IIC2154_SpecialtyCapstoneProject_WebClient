import React, { Component } from 'react';
import { Grid, Col, Panel, Button, Glyphicon } from 'react-bootstrap';
import { browserHistory } from 'react-router';

import app from '../../app';
const atlasService = app.service('/atlass');

export default class AtlasTab extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      atlases: [],
    };
    this.createAtlas = this.createAtlas.bind(this);
    this.fetch = this.fetch.bind(this);
    this.fetch(this.props.organization.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.organization) {
      this.fetch(nextProps.organization.id);
    }
  }

  fetch(organizationId) {
    const query = {
      organizationId,
    };
    return atlasService.find({ query })
      .then(result => {
        console.log(result);
        return result.data;
      })
      .then(atlases => this.setState({ atlases }));
  }

  createAtlas() {
    const url = `/organizations/show/${this.props.organization.id}/atlases/create`;
    return browserHistory.push(url);
  }

  render() {
    return (
      <Grid style={styles.container}>

        <Col xs={12} md={9}>
          {/* TODO: Add link */}
          {this.state.atlases.map((atlas, i) => (
            <p key={i}>{atlas.title}</p>
          ))}
        </Col>

        <Col xs={12} md={3}>
          <Panel>
            <h4>Atlases</h4>
            <p>Create content with text, images, videos and more!</p>
            <hr />
            <p>Do you want to be your own publisher?</p>
            <Button bsStyle="primary" bsSize="small" onClick={this.createAtlas}>
              <Glyphicon glyph="plus" /> Create atlas
            </Button>
          </Panel>
        </Col>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
};
