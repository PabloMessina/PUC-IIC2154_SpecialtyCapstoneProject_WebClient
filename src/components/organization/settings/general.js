import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import ErrorAlert from '../../error-alert';

import OrganizationFrom from '../../organization-form/';

import app from '../../../app';
const organizationService = app.service('/organizations');


export default class OrganizationSettingsGeneral extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      error: null,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(organization) {
    this.setState({ disabled: true });
    return organizationService.update(this.props.organization.id, organization)
      .then(() => this.setState({ disabled: false, error: null }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const organization = this.props.organization;

    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12}>
            <ErrorAlert
              error={this.state.error}
              onDismiss={() => this.setState({ error: null })}
            />

            <OrganizationFrom
              organization={organization}
              disabled={this.state.disabled}
              onSubmit={this.onSubmit}
              action="Update organization"
            />
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
