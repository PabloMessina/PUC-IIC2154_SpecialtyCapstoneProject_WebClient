import React, { Component } from 'react';
import {
  Button,
  Grid,
  Row,
  Col,
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
  Alert,

} from 'react-bootstrap';
import Icon from 'react-fa';
import { browserHistory } from 'react-router';
import renderIf from 'render-if';

import app from '../../app';

const organizationService = app.service('/organizations');

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

const MIN_LENGTH = 5;
const SUBSCRIPTION = [{
  name: 'Basic Plan',
  value: 50,
}, {
  name: 'Pro Plan',
  value: 100,
}, {
  name: 'Premium',
  value: 300,
}];

export default class OrganizationCreate extends Component {
  static get propTypes() {
    return {
      name: React.PropTypes.string,
      address: React.PropTypes.string,
      subscription: React.PropTypes.number,
      logo: React.PropTypes.string,
    };
  }

  static get defaultProps() {
    return {
      name: '',
      nameValidation: null,
      address: '',
      subscription: 0, // Basic
      logo: '',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      address: this.props.address,
      subscription: this.props.subscription,
      logo: this.props.logo,
      didSubmit: false,
      submiting: false,
      error: null,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.setName = this.setName.bind(this);
    this.validateName = this.validateName.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    this.setState({ submiting: true, didSubmit: true });

    const options = {
      name: this.state.name,
      description: this.state.description,
      subscription: Number(this.state.subscription),
    };

    return organizationService.create(options)
      .then(organization => browserHistory.push(`/organizations/show/${organization.id}`))
      .catch(err => this.setState({ submiting: false, error: err }));
  }

  setName(value) {
    const name = value || '';
    this.setState({ name, nameValidation: this.validateName(name) });
  }

  validateName(name) {
    if (name && name.length > MIN_LENGTH) return 'success';
    else if (this.state.didSubmit) return null;
    return null;
  }

  /*  revisar https://github.com/alsoscotland/react-super-select  */
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
                <h4>Oh snap! You got an error!</h4>
                <p>{this.state.error.message}</p>
              </Alert>
            )}

            <form onSubmit={this.onSubmit}>

              <FormGroup controlId="name" validationState={this.state.nameValidation}>
                <ControlLabel>Organization name</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.name}
                  placeholder="University of Neverland"
                  label="Organization name"
                  onChange={e => this.setName(e.target.value)}
                />
                <FormControl.Feedback />
                <HelpBlock>Must be unique and not too short</HelpBlock>
              </FormGroup>

              <FormGroup controlId="description">
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={this.state.description}
                  placeholder="Organization description..."
                  onChange={e => this.setState({ description: e.target.value })}
                />
              </FormGroup>

              <FormGroup controlId="address">
                <ControlLabel>Address</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.address}
                  placeholder="Royal Avenue 53, Miami"
                  label="Address"
                  onChange={e => this.setState({ address: e.target.value })}
                />
                <HelpBlock>Optional</HelpBlock>
              </FormGroup>

              <hr />

              <FormGroup controlId="subscription">
                <ControlLabel>Suscription Plan</ControlLabel>
                <FormControl
                  componentClass="select"
                  placeholder="Select subscription plan"
                  onChange={e => this.setState({ subscription: e.target.value })}
                >
                  {SUBSCRIPTION.map((sub, i) => <option key={i} value={sub.value}>{sub.name}</option>)}
                </FormControl>
              </FormGroup>

              <hr />

              <Button bsStyle="primary" type="submit" disabled={this.state.submiting}>
                Create Organization
              </Button>
            </form>
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
