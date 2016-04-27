/* eslint strict:0 no-param-reassign: 0 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, IndexRedirect, browserHistory } from 'react-router';

import app, { auth, currentUser } from './app';

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

import CourseStudents from './components/course-students/';
import CourseEvaluations from './components/course-evaluations/';

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

function populate(...names) {
  return function func(nextState, replace, next) {
    // Auth if user is not present
    const user = currentUser() ? Promise.resolve(true) : auth();

    // Auth user (if needed) then perform parallel requests to the server
    const requests = user.then(() => {
      const promises = names.map(({ field, to, service }) => {
        // Get object in params if present
        const param = nextState.params[to];
        if (param) return param;

        // Get object from Web API
        const identifier = nextState.params[field];
        return app.service(service || `/${to}s`).get(identifier)
          .then(object => (nextState.params[to] = object));
      });
      return Promise.all(promises);
    });

    // Finish hook
    return requests.then(() => next());
  };
}

const Routing = (
  <Router history={browserHistory}>
    <Route path="/" component={Main} title="App">
      <IndexRoute component={Dashboard} />

      <Route path="login" component={Login} onEnter={requireAnnon} />
      <Route path="signup" component={SignUp} onEnter={requireAnnon} />

      <Route path="create-atlas" component={CreateAtlas} />

      <Route path="documents" component={DocumentList} onEnter={requireAuth} />
      <Route
        path="documents/:docId"
        component={DocumentDescription}
        onEnter={populate({ field: 'docId', to: 'atlas', service: 'atlases' })}
      />

      <Route path="settings" component={Settings} >
        <IndexRoute component={GeneralSettings} />
        <Route path="notifications" component={NotificationSettings} />
        <Route path="security" component={SecuritySettings} />
        <Route path="payments" component={PaymentsSettings} />
        <Route path="myatlas" component={MyAtlasSettings} />
      </Route>

      <Route path="organizations/create" component={OrganizationCreate} />

      <Route
        path="organizations/show/:organizationId"
        component={Organization}
        onEnter={populate({ field: 'organizationId', to: 'organization' })}
      />

      <Route
        path="organizations/show/:organizationId/courses/create"
        component={CourseCreate}
        onEnter={populate({ field: 'organizationId', to: 'organization' })}
      />

      <Route
        path="courses/show/:courseId"
        component={Course}
        onEnter={populate({ field: 'courseId', to: 'course' })}
      >
        <IndexRedirect to="evaluations" />
        <Route path="students" component={CourseStudents} />
        <Route path="analytics" component={CourseStudents} />
        <Route path="evaluations" component={CourseEvaluations} />
      </Route>

      <Route
        path="courses/show/:courseId/evaluations/create"
        component={EvaluationCreate}
        onEnter={populate({ field: 'courseId', to: 'course' })}
      >
        <IndexRedirect to="description" />
        <Route path="description" component={EvaluationCreateDescripction} />
        <Route path="questions" component={EvaluationCreateQuestions} />
        <Route path="students" component={EvaluationCreateStudents} />
        <Route path="results" component={EvaluationCreateResults} />
        <Route path="recorrection" component={EvaluationCreateRecorrection} />
      </Route>

      <Route path="editor" component={Editor} />
      <Route path="tree" component={Tree} />
      <Route path="template" component={Template} />
    </Route>
  </Router>
);

ReactDOM.render(Routing, document.getElementById('root'));
