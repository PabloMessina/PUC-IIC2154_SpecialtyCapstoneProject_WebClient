/* eslint strict:0 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Main from './components/main';
import Dashboard from './components/dashboard';
import Login from './components/login/';
import Join from './components/join/';
import Editor from './components/editor/';

// Development help
// Go to: http://localhost:3000/template
import Template from './utils/template';


const Routing = (
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
      <IndexRoute component={Dashboard} />
      <Route path="login" component={Login} />
      <Route path="join" component={Join} />
      <Route path="editor" component={Editor} />

      <Route path="template" component={Template} />
    </Route>
  </Router>
);

ReactDOM.render(Routing, document.body);
