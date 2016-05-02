/* eslint strict:0 no-param-reassign: 0 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, IndexRedirect, browserHistory } from 'react-router';

import app, { auth, currentUser } from './app';

import Main from './components/main';
import Dashboard from './components/dashboard';
import Login from './components/login/';
import SignUp from './components/signup/';

import Settings from './components/settings';
import NotificationSettings from './components/settings/notifications';
import MyAtlasSettings from './components/settings/myatlas';
import GeneralSettings from './components/settings/general';
import SecuritySettings from './components/settings/security';
import PaymentsSettings from './components/settings/payments';

import DocumentList from './components/document-list';
import DocumentDescription from './components/document-description';

import OrganizationCreate from './components/organization-create/';
import Organization from './components/organization';
import OrganizationCoursesTab from './components/organization/courses';
import OrganizationAtlasesTab from './components/organization/atlases';
import OrganizationMembersTab from './components/organization/members';
import OrganizationSettingsTab from './components/organization/settings';
import OrganizationSettingsGeneral from './components/organization/settings/general';
import OrganizationSettingsAdministrative from './components/organization/settings/administrative';

import CourseCreate from './components/course-create/';
import Course from './components/course/';
import CourseInstances from './components/course/instances';
import CourseInstance from './components/course/instance';
import CourseInstanceStudents from './components/course/instance/students';
import CourseInstanceEvaluations from './components/course/instance/evaluations';

import Evaluation from './components/evaluation';
import EvaluationDescripction from './components/evaluation/description';
import EvaluationQuestions from './components/evaluation/questions';
import EvaluationStudents from './components/evaluation/students';
import EvaluationResults from './components/evaluation/results';
import EvaluationRecorrection from './components/evaluation/recorrection';

import AtlasCreate from './components/atlas-create/';
import AtlasBook from './components/atlas-book/';
import Questions from './components/questions/';

import Renderer3D from './components/renderer-3d/';
import RendererWrapper from './components/renderer-wrapper/';

// Development help
// Go AtlasBook: http://localhost:3000/template
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

      <Route path="renderer-3d" component={Renderer3D} />
      <Route path="renderer-wrapper" component={RendererWrapper} />

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
      >
        <IndexRedirect to="courses" />
        <Route path="courses" component={OrganizationCoursesTab} />
        <Route path="atlases" component={OrganizationAtlasesTab} />
        <Route path="questions" component={OrganizationMembersTab} />
        <Route path="members" component={OrganizationMembersTab} />
        <Route path="settings" component={OrganizationSettingsTab}>
          <IndexRedirect to="general" />
          <Route path="general" component={OrganizationSettingsGeneral} />
          <Route path="administrative" component={OrganizationSettingsAdministrative} />
        </Route>
      </Route>

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
        <IndexRedirect to="instances" />
        <Route path="instances" component={CourseInstances}>
          <Route path=":instanceId" component={CourseInstance}>
            <IndexRedirect to="evaluations" />
            <Route path="students" component={CourseInstanceStudents} />
            <Route path="analytics" component={CourseInstanceStudents} />
            <Route path="evaluations" component={CourseInstanceEvaluations} />
          </Route>
        </Route>
      </Route>

      <Route
        path="evaluations/show/:evaluationId"
        component={Evaluation}
        onEnter={populate({ field: 'evaluationId', to: 'evaluation' })}
      >
        <IndexRedirect to="description" />
        <Route path="description" component={EvaluationDescripction} />
        <Route path="questions" component={EvaluationQuestions} />
        <Route path="students" component={EvaluationStudents} />
        <Route path="results" component={EvaluationResults} />
        <Route path="recorrection" component={EvaluationRecorrection} />
      </Route>

      <Route
        path="organizations/show/:organizationId/atlases/create"
        component={AtlasCreate}
        onEnter={populate({ field: 'organizationId', to: 'organization' })}
      />

      <Route
        path="editor/:atlasId"
        component={AtlasBook}
        onEnter={populate({ field: 'atlasId', to: 'atlas', service: 'atlases' })}
      />
      <Route path="template" component={Template} />
      <Route path="questions" component={Questions} />
    </Route>
  </Router>
);

ReactDOM.render(Routing, document.getElementById('root'));
