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
import OrganizationQuestionTab from './components/organization/questions';
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
import CourseSettings from './components/course/setting';
import CourseInstanceCreate from './components/course/instance-create';

import Evaluation from './components/evaluation';
import EvaluationDescripction from './components/evaluation/description';
import EvaluationQuestions from './components/evaluation/questions';
import EvaluationStudents from './components/evaluation/students';
import EvaluationResults from './components/evaluation/results';
import EvaluationRecorrection from './components/evaluation/recorrection';

import AtlasCreate from './components/atlas-create/';
import AtlasBook from './components/atlas-book/';

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

function fetching(...names) {
  return function func(nextState, replace, next) {
    // Auth if user is not present
    const user = currentUser() ? Promise.resolve(true) : auth();

    // Auth user (if needed) then perform parallel requests to the server
    const requests = user.then(() => {
      const promises = names.map(({ field, to, service, populate }) => {
        // TODO: Get object in params if present
        // const param = nextState.params[to];
        // if (param) return param;

        // Get object from Web API
        const query = {
          id: nextState.params[field],
          $limit: 1,
          $populate: populate,
        };
        return app.service(service || `/${to}s`).find({ query })
          // TODO: redirect to 404 if not found
          .then(result => (result.total ? result.data[0] : {}))
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
        onEnter={fetching({ field: 'docId', to: 'atlas', service: 'atlases' })}
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
        onEnter={fetching({ field: 'organizationId', to: 'organization' })}
      >
        <IndexRedirect to="courses" />
        <Route path="courses" component={OrganizationCoursesTab} />
        <Route path="atlases" component={OrganizationAtlasesTab} />
        <Route path="questions" component={OrganizationQuestionTab} />
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
        onEnter={fetching({ field: 'organizationId', to: 'organization' })}
      />

      <Route
        path="courses/show/:courseId"
        component={Course}
        onEnter={fetching({ field: 'courseId', to: 'course', populate: ['organization', 'instance'] })}
      >
        <IndexRedirect to="instances" />
        <Route path="instances" component={CourseInstances}>
          <Route path="settings" component={CourseSettings} />
          <Route path="create" component={CourseInstanceCreate} />
          <Route path="show/:instanceId" component={CourseInstance}>
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
        onEnter={fetching({ field: 'evaluationId', to: 'evaluation', populate: ['attendance', 'question'] })}
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
        onEnter={fetching({ field: 'organizationId', to: 'organization' })}
      />

      <Route
        path="editor/:atlasId"
        component={AtlasBook}
        onEnter={fetching({ field: 'atlasId', to: 'atlas', service: 'atlases' })}
      />

      <Route path="template" component={Template} />
    </Route>
  </Router>
);

ReactDOM.render(Routing, document.getElementById('root'));
