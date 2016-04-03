import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import io from 'socket.io-client';
import socketio from 'feathers-socketio/client';
import authentication from 'feathers-authentication/client';

/**
 * App singleton instance
 *
 * Usage:
 * import app from '../../app';
 */

const host = 'http://localhost:3030';
const socket = io(host);

// Set up Feathers client side
const app = feathers();
// Register hooks module
app.configure(hooks());
// Register socket.io
app.configure(socketio(socket));
// Set up authentication with a store to cache your auth token
app.configure(authentication({ storage: window.localStorage }));

export default app;
