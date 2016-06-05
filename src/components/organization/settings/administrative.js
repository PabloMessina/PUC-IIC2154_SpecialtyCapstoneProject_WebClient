import React, { Component } from 'react';
import { Row, Col, Alert, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';
import renderIf from 'render-if';

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
    const organization = this.props.organization;
    return organizationService.remove(organization.id)
      .then(() => this.props.router.push('/'))
      .catch(error => this.setState({ error }));
  }

  render() {
    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12}>
            {renderIf(this.state.error)(() =>
              <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
                <p>{this.state.error.message}</p>
              </Alert>
            )}
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
