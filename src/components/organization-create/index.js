import React, { Component } from 'react';
import { Button, Col, Input, Combobox, MenuItem, DropdownButton, ButtonToolbar} from 'react-bootstrap';
import renderIf from 'render-if';

import app, { user } from '../../app';

const organizationService = app.service('/organizations');

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

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
    };

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const options = {
      name: this.state.name,
      description: this.state.description,
      subscription: Number(this.state.subscription),
    };

    return organizationService.create(options).then(organization => {
      console.log(organization);
    }).catch(err => {
      console.log(err);
    });
  }

  /*  revisar https://github.com/alsoscotland/react-super-select  */
  render() {
    return (
      <div style={styles.container}>
        <form onSubmit={this.onSubmit}>

          <Input
            type="text"
            value={this.state.name}
            placeholder="University of Neverland"
            label="Enter organization name"
            onChange={e => this.setState({ name: e.target.value })}
          />

          <Input
            type="text"
            value={this.state.address}
            placeholder="Royal Avenue 53, Miami"
            label="Billing address"
            onChange={e => this.setState({ address: e.target.value })}
          />

          <Input
            type="select"
            label="Select Suscription Plan"
            onChange={e => this.setState({ subscription: e.target.value })}
          >
            {SUBSCRIPTION.map(sub => <option value={sub.value}>{sub.name}</option>)}
          </Input>

          <Button
            bsStyle="primary"
            bsSize="large"
            type="submit"
          >
            Create Organization
          </Button>
        </form>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
