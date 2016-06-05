/* eslint no-console:0 */

import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import io from 'socket.io-client';
import socketio from 'feathers-socketio/client';
import authentication from 'feathers-authentication/client';
import rx from 'feathers-reactive';
import RxJS from 'rxjs';

/**
 * App singleton instance
 *
 * Usage:
 * import app, { join, login, auth, logout, user } from '../../app';
 */

const host = 'https://karp.ing.puc.cl/';
const socket = io(host);

// Set up Feathers client side
const app = feathers();
// Register hooks module
app.configure(hooks());
// Configure reactive extensions
app.configure(rx(RxJS));
// Register socket.io
app.configure(socketio(socket));
// Configure reactive extensions
app.configure(rx(RxJS));
// Set up authentication with a store to cache your auth token
app.configure(authentication({ storage: window.localStorage }));

/**
 * Authenticate with server backend
 * @param  {options.email} User email address
 * @param  {options.password} User password
 * @return {Promise}
 */
export function login(options) {
  return app.authenticate({ type: 'local', ...options }).catch(err => {
    console.log(`Auth error for ${options.email}`);
    console.log(err);
    throw err;
  });
}

/**
 * Use local saved credentials to auth with server
 * @return {Promise}
 */
export function auth() {
  return app.authenticate()
    .then(result => {
      console.log('Logged as:', result.data.name);
      return result;
    })
    .catch(err => {
      console.log('Auth error:', err);
      throw err;
    });
}

/**
 * Create new user account
 * @param  {options.email} User email address
 * @param  {options.password} User password
 * @param  {options.name} User name
 * @return {Promise}
 */
export function join(options) {
  return app.service('users').create({ type: 'local', ...options }).catch(err => {
    console.log(`User creation error for ${options.email}`);
    console.log(err);
    throw err;
  });
}

/**
 * Logout and delete credentials
 * @return {Promise}
 */
export function logout() {
  return app.logout();
}

/**
 * Get current user
 * @return {Object} Current user
 */
export function currentUser() {
  return app.get('user');
}

export const events = {
  connected: RxJS.Observable.fromEvent(app.io, 'connect'),
  disconnected: RxJS.Observable.fromEvent(app.io, 'disconnect'),
  reconnected: RxJS.Observable.fromEvent(app.io, 'reconnect'),
};

export default app;
