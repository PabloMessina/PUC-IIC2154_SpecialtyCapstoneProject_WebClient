/* eslint no-console: 0 */

import React, { Component } from 'react';
// import { Grid } from 'react-bootstrap';
import Icon from 'react-fa';

import app, { currentUser, events } from '../../app';
import NavigationBar from '../navigation-bar';


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
      connected: false,
      transport: null,
      error: null,
    };
    this.observers = [];
  }

  componentDidMount() {
    this.observers = [
      this.connectionObserver = events.connected.subscribe(() => {
        const transport = app.io.io.engine.transport.name;
        console.log('Connected with', transport);
        this.setState({ transport, connected: true });
      }),
      this.disconnectionObserver = events.disconnected.subscribe(() => {
        console.log('Disconnected');
        this.setState({ connected: false });
      }),
    ];
  }

  componentWillUnmount() {
    this.observers.forEach(observer => observer.unsubscribe());
  }

  render() {
    const { route, ...props } = this.props;
    const { title } = route;
    const { connected, transport } = this.state;
    const user = currentUser();

    return (
      <div>

        <NavigationBar title={title} fixedTop user={user} connected={connected} />

        <div style={styles.content} {...props}>
          {this.props.children}
        </div>

        <footer className="footer">
          <div className="container">
            <p className="text-muted" style={styles.footer}>
              <small>{transport}</small> | From team5.js with <Icon name="heart" />
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
