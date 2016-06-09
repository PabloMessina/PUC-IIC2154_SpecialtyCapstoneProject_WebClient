/* eslint no-console:0 */

import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import io from 'socket.io-client';
import socketio from 'feathers-socketio/client';
import authentication from 'feathers-authentication/client';
import errors from 'feathers-errors';
import reactive from 'feathers-reactive';
import Rx from 'rxjs';

/**
 * App singleton instance
 *
 * Usage:
 * import app, { join, login, currentUser, logout } from '../../app';
 *
 * const { id, name } = currentUser();
 *
 * const query = {
 *   id: { $in: [1, 2, 3] },
 * };
 * app.service('/organizations').find({ query }).then(results => {
 *   const { total, data } = results;
 *   // Data is an array on length 'total'.
 * });
 *
 * app.service('/organizations').create({ name: 'Name' }).then(organization => {
 *   const id = organization.id;
 * });
 *
 * const id = 2;
 * app.service('/organizations').get(id).then(data => {
 *   // Data is the organization as JSON
 *   const name = data.name;
 * });
 *
 * app.service('/organizations').patch(id, { name: 'New Name' }).then(data => {
 *   // Updated data
 *   const name = data.name;
 * });
 */

 /**
  * Setup Web API endpoint
  */
const host = 'https://karp.ing.puc.cl/';
const socket = io(host, {
  // transports: ['websocket'],
  // forceNew: true,
});

const KEYS = {
  token: 'atlas-jwt',
  user: 'atlas-user',
};

// Set up Feathers client side
const app = feathers();
// Register socket.io
app.configure(socketio(socket));
// Register hooks module
app.configure(hooks());
// Configure reactive extensions
app.configure(reactive(Rx));
// Set up authentication with a store to cache your auth token
app.configure(authentication({
  storage: window.localStorage,
  cookie: KEYS.token,
  tokenKey: KEYS.token,
}));


/**
 * Hot Observables, all of the saves the last emited value
 * @type {Object}
 */
export const events = {
  connected: new Rx.ReplaySubject(1),
  disconnected: new Rx.ReplaySubject(1),
  reconnected: new Rx.ReplaySubject(1),
  authenticated: new Rx.ReplaySubject(1),
};
// Convert event to subject
Rx.Observable.fromEvent(app.io, 'connect').subscribe(events.connected);
Rx.Observable.fromEvent(app.io, 'disconnect').subscribe(events.disconnected);
Rx.Observable.fromEvent(app.io, 'reconnect').subscribe(events.reconnected);

/**
 * Prepare application
 * @return {Promise} Resolved when ready
 */
export async function setup() {
  // Load user from storage
  const user = await Promise.resolve(app.get('storage').getItem(KEYS.user)).then(data => JSON.parse(data));
  app.set('user', user);

  // Load token from storage
  const hash = await Promise.resolve(app.get('storage').getItem(KEYS.token));
  app.set('token', hash);

  return app;
}

/**
* Save user to local storage
* @param {Object} result API response
* @return {Object} User object
*/
async function saveCredentials(result) {
  const user = result.data;
  await Promise.resolve(app.get('storage').setItem(KEYS.user, JSON.stringify(user)));
  // This is done internally by the library
  // const hash = result.token;
  // await Promise.resolve(app.get('storage').setItem(KEYS.token, hash));

  // Emit authenticated user
  console.log('Logged as:', user.name);
  events.authenticated.next(user);

  return user;
}

/**
 * Authenticate with server backend
 * @param  {options.email} User email address
 * @param  {options.password} User password
 * @return {Promise}
 */
export function login(options) {
  return app.authenticate({ type: 'local', ...options })
    .then(saveCredentials)
    .catch(err => {
      console.log(`Auth error for ${options.email}`);
      console.log(err);
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
 * Use local saved credentials to auth with server
 * @return {Promise} Resolves to User object
 */
export function auth(options) {
  return app.authenticate(options)
    .then(saveCredentials)
    .catch(err => {
      console.log('Auth error:', err);
      events.authenticated.next(null);
      // Strange error
      if (err.name === 'NotFound') throw new errors.NotAuthenticated();
      else throw err;
    });
}

/**
 * Logout and delete credentials
 * @return {Promise}
 */
export function logout(options) {
  return app.logout(options)
    .then(() => Promise.resolve(app.get('storage').removeItem(KEYS.user)));
}

/**
 * Get current user
 * @return {Object} Current user
 */
export function currentUser() {
  return app.get('user');
}

/**
 * Get current session token
 * @return {String} Session token
 */
export function token() {
  return app.get('token');
}

export default app;
