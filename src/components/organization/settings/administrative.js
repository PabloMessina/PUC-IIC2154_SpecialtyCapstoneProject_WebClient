import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';
import ErrorAlert from '../../error-alert';

import app from '../../../app';
const organizationService = app.service('/organizations');


class OrganizationSettingsAdministrative extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      router: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
    this.onPress = this.onPress.bind(this);
  }

  onPress() {
    if (window.confirm('Do you really want to delete this organization?')) {
      const organization = this.props.organization;
      return organizationService.remove(organization.id)
        .then(() => this.props.router.push('/'))
        .catch(error => this.setState({ error }));
    }
    return Promise.reject('Cancel by user.');
  }

  render() {
    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12}>
            <ErrorAlert
              error={this.state.error}
              onDismiss={() => this.setState({ error: null })}
            />
            <p>
              Delete organization and all their courses.
            </p>
            <Button bsStyle="danger" onClick={this.onPress}>
              Remove organization
            </Button>
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

export default withRouter(OrganizationSettingsAdministrative);
