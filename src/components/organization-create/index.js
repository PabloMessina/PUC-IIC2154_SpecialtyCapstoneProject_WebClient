import React, { Component } from 'react';
import {
  Grid,
  Row,
  Col,
  Panel,
  Alert,
} from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import renderIf from 'render-if';

import OrganizationFrom from '../organization-form/';

import app from '../../app';
const organizationService = app.service('/organizations');


class OrganizationCreate extends Component {
  static get propTypes() {
    return {
      static: React.PropTypes.bool,
      router: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      static: true,
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

    return organizationService.create(organization)
      .then(result => this.props.router.push(`/organizations/show/${result.id}`))
      .catch(error => this.setState({ error, disabled: false }));
  }

  render() {
    return (
      <Grid style={styles.container}>

        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={7}>
            <h2>New Organization</h2>
          </Col>
        </Row>

        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={7}>
            <p>An organization is a community of students and teachers from a common institution.</p>
            <ul>
              <li>Create courses and keep a store of questions.</li>
              <li>Manage students and teachers.</li>
              <li>Create real-time quizzes and grade statistical analytics.</li>
            </ul>
            <p>Any participant can be student or teacher for different courses.</p>

            <hr />

            {renderIf(this.state.error)(() =>
              <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
                <p>{this.state.error.message}</p>
              </Alert>
            )}

            <OrganizationFrom disabled={this.state.disabled} onSubmit={this.onSubmit} />

          </Col>

          <Col xsOffset={0} xs={12} sm={3}>
            <Panel>
              <h5><Icon style={styles.icon} size="lg" name="info-circle" /> Need help?</h5>
              <hr />
              <p>Take a look at our showcase or contact us.</p>
            </Panel>
          </Col>

        </Row>
      </Grid>
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

export default withRouter(OrganizationCreate);
