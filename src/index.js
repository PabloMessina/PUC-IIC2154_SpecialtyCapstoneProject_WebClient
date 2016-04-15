/* eslint strict:0 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Main from './components/main';
import Dashboard from './components/dashboard';
import Login from './components/login/';
import Join from './components/join/';
import Courses from './components/courses';
import Course from './components/course/';
import CourseNav from './components/course-nav/';
import OrganizationCreate from './components/organization-create/';
import CourseCreate from './components/course-create/';


// Development help
// Go to: http://localhost:3000/template
import Template from './utils/template';

const Routing = (
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
      <IndexRoute component={Dashboard} />
      <Route path="login" component={Login} />
      <Route path="join" component={Join} />
      <Route path="courses" component={Courses}>
        <Route path=":courseId" component={Course} />
      </Route>
      <Route path="organization_create" component={OrganizationCreate} />
      <Route path="course_general" component={CourseNav} />
      <Route path="course_create" component={CourseCreate} />
      <Route path="template" component={Template} />
    </Route>
  </Router>
);

ReactDOM.render(Routing, document.body);
