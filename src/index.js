/* eslint strict:0 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Main from './components/main';
import Dashboard from './components/dashboard';
import Login from './components/login/';
import CreateAtlas from './components/create-atlas';
import SignUp from './components/signup/';
import Settings from './components/settings';
import NotificationSettings from './components/settings/notifications';
import MyAtlasSettings from './components/settings/myatlas';
import GeneralSettings from './components/settings/general';
import SecuritySettings from './components/settings/security';
import PaymentsSettings from './components/settings/payments';
import DocumentList from './components/document-list';
import DocumentDescription from './components/document-description';
import Courses from './components/courses';
import Course from './components/course/';
import CourseNav from './components/course-nav/';
import CourseCreate from './components/course-create/';
import OrganizationCreate from './components/organization-create/';
import AtlasTree from './components/atlas-tree/';
import AtlasBook from './components/atlas-book/';

// Development help
// Go AtlasBook: http://localhost:3000/template
import Template from './utils/template';

const Routing = (
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
      <IndexRoute component={Dashboard} />

      <Route path="login" component={Login} />
      <Route path="signup" component={SignUp} />

      <Route path="documents" component={DocumentList} />
      <Route path="documents/:docId" component={DocumentDescription} />

      <Route path="settings" component={Settings} >
        <IndexRoute component={GeneralSettings} />
        <Route path="notifications" component={NotificationSettings} />
        <Route path="security" component={SecuritySettings} />
        <Route path="payments" component={PaymentsSettings} />
        <Route path="myatlas" component={MyAtlasSettings} />
      </Route>

      <Route path="organization_create" component={OrganizationCreate} />
      <Route path="courses" component={Courses}>
        <Route path=":courseId" component={Course} />
      </Route>
      <Route path="course_general" component={CourseNav} />
      <Route path="course_create" component={CourseCreate} />

      <Route path="create-atlas" component={CreateAtlas} />
      <Route path="editor/:atlasId" component={AtlasBook} />
      <Route path="template" component={Template} />
    </Route>
  </Router>
);

ReactDOM.render(Routing, document.getElementById('root'));
