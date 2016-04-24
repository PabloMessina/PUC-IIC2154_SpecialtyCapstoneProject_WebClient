/* eslint no-console: 0 */

import React, { Component } from 'react';
// import { Grid } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';

import app, { currentUser, auth } from '../../app';
import NavigationBar from '../navigation-bar';

const organizationService = app.service('/organizations');
const membershipService = app.service('/memberships');

const STATES = {
  LOADING: 'LOADING',
  AUTHED: 'AUTHED',
  ANNON: 'ANNON',
};

export default class Main extends Component {

  static get propTypes() {
    return {
      title: React.PropTypes.string,
      route: React.PropTypes.any,
      children: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      state: STATES.LOADING,
      error: null,
    };
    this.auth().then(() => this.fetchOrganizations());
  }

  auth() {
    return auth().then(() => {
      console.log('Logged as:', currentUser().name);
      this.setState({ state: STATES.AUTHED });
    }).catch(err => {
      console.log('Auth error:', err);
      this.setState({ state: STATES.ANNON, error: err });
    });
  }

  fetchOrganizations() {
    let query = {
      userId: currentUser().id,
    };
    return membershipService.find({ query })
      .then(result => result.data)
      .then(memberships => {
        query = {
          id: { $in: memberships.map(membership => membership.organizationId) },
        };
        return organizationService.find({ query });
      })
      .then(result => result.data)
      .then(organizations => this.setState({ organizations }));
  }

  render() {
    const { route, ...props } = this.props;
    const { title } = route;
    const { state, organizations } = this.state;
    const user = currentUser();

    return (
      <div>

        <NavigationBar title={title} fixedTop user={user} organizations={organizations} />

        {/* Render content only if the user is annon or is authed */}
        {renderIf(state === STATES.ANNON || state === STATES.AUTHED)(() => (
          <div style={styles.content} {...props}>
            {this.props.children}
          </div>
        ))}

        <footer className="footer">
          <div className="container">
            <p className="text-muted" style={styles.footer}>
              From team5.js with <Icon name="heart" />
            </p>
          </div>
        </footer>

      </div>
    );
  }
}

const styles = {
  content: {
    paddingTop: 66,
    marginBottom: 100,
  },
  footer: {
    margin: 12,
  },
};
