import React, { PropTypes, Component } from 'react';
import { Grid, Col, Panel, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';
import AtlasGrid from '../document-list/atlas-grid';
import renderIf from 'render-if';
import Icon from 'react-fa';

import app from '../../app';
const atlasService = app.service('/atlases');

class AtlasTab extends Component {

  static get propTypes() {
    return {
      organization: PropTypes.object,
      membership: PropTypes.object,
      router: PropTypes.object,
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
      .then(result => result.data)
      .then(atlases => this.setState({ atlases }));
  }

  createAtlas() {
    const url = `/organizations/show/${this.props.organization.id}/atlases/create`;
    return this.props.router.push(url);
  }

  render() {
    const { membership } = this.props;

    return (
      <Grid style={styles.container}>
        <Col xs={12} md={9}>
          <AtlasGrid atlases={this.state.atlases} />
        </Col>
        <Col xs={12} md={3}>
          <Panel>
            <h4>Atlases</h4>
            <p>Create content with text, images, videos and more!</p>
            {renderIf(['admin', 'write'].includes(membership.permission))(() =>
              <div>
                <hr />
                <p>Do you want to be your own publisher?</p>
                <Button bsStyle="primary" bsSize="small" onClick={this.createAtlas}>
                  <Icon name="plus" style={styles.icon} /> Create atlas
                </Button>
              </div>
            )}
          </Panel>
        </Col>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
  icon: {
    marginRight: 4,
  },
};

export default withRouter(AtlasTab);
