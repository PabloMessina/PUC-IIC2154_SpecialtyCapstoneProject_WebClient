import React, { Component } from 'react';
import { Nav, NavItem } from 'react-bootstrap';

import Summary from './summary.js';


export default class InstanceAnalytics extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      instance: React.PropTypes.object,
      // React Router
      params: React.PropTypes.object,
      evaluations: React.PropTypes.array,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div style={styles.container}>
        <h3>Analytics</h3>
        <Nav bsStyle="tabs" activeKey={1}>
          <NavItem eventKey={1} active>Grades Summary</NavItem>
        </Nav>
        <br />
        <Summary instance={this.props.instance} />
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
