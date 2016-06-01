/* eslint no-console: 0 */

import React, { Component } from 'react';
// import { Grid } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';

import app, { currentUser, auth } from '../../app';
import NavigationBar from '../navigation-bar';

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
      connected: false,
      error: null,
    };
    this.auth = this.auth.bind(this);
  }

  componentDidMount() {
    this.auth();

    app.io.on('connect', () => {
      this.setState({ connected: true });
    });

    app.io.on('disconnect', () => {
      this.setState({ connected: false });
    });
  }

  auth() {
    return auth().then(result => {
      console.log('Logged as:', result.data.name);
      this.setState({ state: STATES.AUTHED });
    }).catch(err => {
      console.log('Auth error:', err);
      this.setState({ state: STATES.ANNON, error: err });
    });
  }

  render() {
    const { route, ...props } = this.props;
    const { title } = route;
    const { state, connected } = this.state;
    const user = currentUser();

    return (
      <div>

        <NavigationBar title={title} fixedTop user={user} connected={connected} />

        {/* Render content only if the user is annon or is authed */}
        {renderIf(state !== STATES.LOADING)(() => (
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
