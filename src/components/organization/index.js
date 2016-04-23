import React, { Component } from 'react';
import { Grid } from 'react-bootstrap';
// import { Button } from 'react-bootstrap';

import app from '../../app';

const organizationService = app.service('/organizations');

export default class Organization extends Component {

  static get propTypes() {
    return {
      // From react-router
      params: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      organization: null,
    };
    this.fetch();
  }

  fetch() {
    return organizationService.get(this.props.params.organizationId)
      .then(organization => this.setState({ organization }));
  }

  render() {
    const { organization } = this.state;

    if (!organization) return <p>Loading...</p>;

    return (
      <Grid style={styles.container} fluid>
        <p>{organization.name}</p>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
};
