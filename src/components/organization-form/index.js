import React, { Component } from 'react';
import {
  Button,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
} from 'react-bootstrap';
import FileModal from '../file-modal';

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

function validateName(name) {
  if (name && name.length > MIN_LENGTH) return 'success';
  return null;
}


export default class OrganizationForm extends Component {
  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      action: React.PropTypes.string,
      disabled: React.PropTypes.bool,
      onSubmit: React.PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      organization: {
        name: '',
        description: '',
        logo: '',
        subscription: SUBSCRIPTION[0].value,
      },
      action: 'Create organization',
      disabled: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      name: props.organization.name || '',
      description: props.organization.description || '',
      address: props.organization.address || '',
      subscription: props.organization.subscription || '',
      logo: props.organization.logo || '',
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChooseLogo = this.onChooseLogo.bind(this);
    this.showFileModal = this.showFileModal.bind(this);
    this.closeFileModal = this.closeFileModal.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.props.onSubmit) {
      const organization = {
        name: this.state.name,
        description: this.state.description,
        address: this.state.address,
        subscription: this.state.subscription,
        logo: this.state.logo,
      };
      this.props.onSubmit(organization);
    }
  }

  onChooseLogo() {
    const onSuccess = urls => {
      if (urls && urls[0]) {
        this.setState({ logo: urls[0] });
      }
    };
    this.showFileModal({ acceptUrl: true, multiple: false, acceptedFiles: 'image/*', onSuccess });
  }

  showFileModal(props) {
    this.setState({ showFileModal: true, fileModalProps: props });
  }

  closeFileModal(processFiles) {
    // this.focus();
    this.setState({ showFileModal: false, fileModalProps: {} }, () => {
      if (processFiles) processFiles();
    });
  }

  render() {
    const { disabled } = this.props;
    const { showFileModal, fileModalProps } = this.state;

    return (
      <form style={styles.container} onSubmit={this.onSubmit}>

        <FormGroup controlId="name" validationState={validateName(this.state.name)}>
          <ControlLabel>Organization Name*</ControlLabel>
          <FormControl
            type="text"
            value={this.state.name}
            placeholder="University of Neverland"
            label="Organization name"
            onChange={e => this.setState({ name: e.target.value })}
            disabled={disabled}
            required
          />
          <FormControl.Feedback />
          <HelpBlock>Must be unique and not too short</HelpBlock>
        </FormGroup>

        <FormGroup controlId="description">
          <ControlLabel>Description*</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={this.state.description}
            placeholder="Organization description..."
            onChange={e => this.setState({ description: e.target.value })}
            disabled={disabled}
            required
          />
        </FormGroup>

        <FormGroup controlId="logo">
          <ControlLabel>Logo* </ControlLabel>
          <Button onClick={this.onChooseLogo}>
            Select file
          </Button>
        </FormGroup>

        <FormGroup controlId="address">
          <ControlLabel>Address</ControlLabel>
          <FormControl
            type="text"
            value={this.state.address}
            placeholder="Royal Avenue 53, Miami"
            label="Address"
            onChange={e => this.setState({ address: e.target.value })}
            disabled={disabled}
          />
          <HelpBlock>Optional</HelpBlock>
        </FormGroup>

        <FormGroup controlId="subscription">
          <ControlLabel>Suscription Plan</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="Select subscription plan"
            onChange={e => this.setState({ subscription: e.target.value })}
            disabled={disabled}
          >
            {SUBSCRIPTION.map((sub, i) => <option key={i} value={sub.value}>{sub.name}</option>)}
          </FormControl>
        </FormGroup>

        <Button bsStyle="primary" type="submit" disabled={disabled}>
          {this.props.action}
        </Button>
        <FileModal
          show={showFileModal}
          onHide={this.closeFileModal}
          {...fileModalProps}
        />
      </form>
    );
  }
}

const styles = {
  container: {

  },
};
