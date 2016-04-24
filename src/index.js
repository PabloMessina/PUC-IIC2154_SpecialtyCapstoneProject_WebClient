/* eslint strict:0 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import { app, currentUser } from './app';

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
// import Organizations from './components/organizations';
import Organization from './components/organization';
import Course from './components/course/';
import CourseCreate from './components/course-create/';
import OrganizationCreate from './components/organization-create/';
import Tree from './components/hierarchy-navigation/';
import Editor from './components/editor/';

import EvaluationCreate from './components/evaluation-create';
import EvaluationCreateDescripction from './components/evaluation-create/description';
import EvaluationCreateQuestions from './components/evaluation-create/questions';
import EvaluationCreateStudents from './components/evaluation-create/students';
import EvaluationCreateResults from './components/evaluation-create/results';
import EvaluationCreateRecorrection from './components/evaluation-create/recorrection';

// Development help
// Go to: http://localhost:3000/template
import Template from './utils/template';

function requireAuth(nextState, replace) {
  const user = currentUser();
  if (!user) {
    replace({
      pathname: '/login',
      state: { redirection: nextState.location.pathname },
    });
  }
}

function requireAnnon(nextState, replace) {
  // FIXME: this doesn't work on page reload
  const user = currentUser();
  if (user) {
    replace({
      pathname: '/',
      state: { message: 'Already logged in.' },
    });
  }
}

const Routing = (
  <Router history={browserHistory}>
    <Route path="/" component={Main} title="App">
      <IndexRoute component={Dashboard} />

      <Route path="login" component={Login} onEnter={requireAnnon} />
      <Route path="signup" component={SignUp} onEnter={requireAnnon} />

      <Route path="create-atlas" component={CreateAtlas} />

      <Route path="documents" component={DocumentList} onEnter={requireAuth} />
      <Route path="documents/:docId" component={DocumentDescription} />

      <Route path="settings" component={Settings} >
        <IndexRoute component={GeneralSettings} />
        <Route path="notifications" component={NotificationSettings} />
        <Route path="security" component={SecuritySettings} />
        <Route path="payments" component={PaymentsSettings} />
        <Route path="myatlas" component={MyAtlasSettings} />
      </Route>

      <Route path="organizations/create" component={OrganizationCreate} />
      <Route path="organizations/show/:organizationId" component={Organization} />
      <Route path="organizations/show/:organizationId/courses/create" component={CourseCreate} />

      <Route path="courses/show/:courseId" component={Course}>
        <Route path="evaluations/create" component={EvaluationCreate}>
          <Route path="description" component={EvaluationCreateDescripction} />
          <Route path="questions" component={EvaluationCreateQuestions} />
          <Route path="students" component={EvaluationCreateStudents} />
          <Route path="results" component={EvaluationCreateResults} />
          <Route path="recorrection" component={EvaluationCreateRecorrection} />
        </Route>
      </Route>

      <Route path="editor" component={Editor} />
      <Route path="tree" component={Tree} />
      <Route path="template" component={Template} />
    </Route>
  </Router>
);

ReactDOM.render(Routing, document.getElementById('root'));
