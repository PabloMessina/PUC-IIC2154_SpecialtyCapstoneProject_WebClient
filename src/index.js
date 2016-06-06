/* eslint strict:0 no-param-reassign:0, no-console:0 */
'use strict';

// Add Babel polyfill to have ES7 features
import 'babel-core/register';
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Redirect, IndexRoute, IndexRedirect, browserHistory } from 'react-router';
import errors from 'feathers-errors';

import app, { auth, currentUser, events } from './app';

import Main from './components/main';
import Login from './components/login/';
import SignUp from './components/signup/';

import Dashboard from './components/dashboard';
import DashboardAcademic from './components/dashboard/academic';

import Settings from './components/settings';
import NotificationSettings from './components/settings/notifications';
import MyAtlasSettings from './components/settings/myatlas';
import GeneralSettings from './components/settings/general';
import SecuritySettings from './components/settings/security';
import PaymentsSettings from './components/settings/payments';

import DocumentList from './components/document-list';
import DocumentDescription from './components/document-description';

import UserProfile from './components/profile';
import ErrorPage from './components/error-page';

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
import CourseInstanceAnnouncements from './components/course/instance/announcements';
import CourseInstanceAnalytics from './components/course/instance/analytics';
import CourseInstanceBibliography from './components/course/instance/bibliography';
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

import Renderer3DWrapper from './components/renderer-3d-wrapper/';
import ImageWithLabelsWrapper from './components/image-with-labels-wrapper/';

// Development help
// Go AtlasBook: http://localhost:3000/template
import Template from './utils/template';

events.reconnected.subscribe(attempts => {
  console.log(`Reconnected after ${attempts} attempts`);
  return auth();
});

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
    const user = currentUser();
    const authenticating = user ? Promise.resolve(user) : auth();

    // Auth user (if needed) then perform parallel requests to the server
    return authenticating.then(() => {
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
        const path = service || `/${to}s`;
        return app.service(path).find({ query })
          .then(result => {
            if (result.total > 0) return result.data[0];
            else throw new errors.NotFound(`${nextState.params[field]} not found on ${path}`);
          })
          .then(object => (nextState.params[to] = object));
      });
      return Promise.all(promises);
    })
    // Continue to route
    .then(() => next())
    // Redirect to login if error is 401
    .catch(error => {
      if (error.name === 'NotAuthenticated') {
        replace({ pathname: '/login', state: { redirection: nextState.location.pathname } });
      } else {
        replace({ pathname: '/error', state: { error } });
      }
      return next();
    });
  };
}

const Routing = (
  <Router history={browserHistory}>
    <Route path="/" component={Main} title="App">
      <IndexRedirect to="dashboard" />

      <Route path="dashboard" component={Dashboard} onEnter={fetching()}>
        <IndexRedirect to="academic" />
        <Route path="academic" component={DashboardAcademic} />
      </Route>

      <Route path="login" component={Login} onEnter={requireAnnon} />
      <Route path="signup" component={SignUp} onEnter={requireAnnon} />

      <Route path="renderer-3d-wrapper" component={Renderer3DWrapper} />
      <Route path="image-with-labels-wrapper" component={ImageWithLabelsWrapper} />

      <Route path="documents" component={DocumentList} onEnter={fetching()} />
      <Route
        path="documents/:docId"
        component={DocumentDescription}
        onEnter={fetching({ field: 'docId', to: 'atlas', service: 'atlases' })}
      />

      <Route path="settings" component={Settings} onEnter={fetching()}>
        <IndexRoute component={GeneralSettings} />
        <Route path="notifications" component={NotificationSettings} />
        <Route path="security" component={SecuritySettings} />
        <Route path="payments" component={PaymentsSettings} />
        <Route path="myatlas" component={MyAtlasSettings} />
      </Route>

      <Route path="organizations/create" component={OrganizationCreate} onEnter={fetching()} />

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
            <IndexRedirect to="announcements" />
            <Route path="announcements" component={CourseInstanceAnnouncements} />
            <Route path="students" component={CourseInstanceStudents} />
            <Route path="analytics" component={CourseInstanceAnalytics} />
            <Route path="evaluations" component={CourseInstanceEvaluations} />
            <Route path="bibliography" component={CourseInstanceBibliography} />
          </Route>
        </Route>
      </Route>

      <Route
        path="evaluations/show/:evaluationId"
        component={Evaluation}
        onEnter={fetching({
          field: 'evaluationId',
          to: 'evaluation',
          populate: ['instance', 'attendance', 'question'],
        })}
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

      <Route path="profile" component={UserProfile} onEnter={fetching()} />

      <Route path="error(/:number)" component={ErrorPage} />
      <Redirect from="*" to="error/404" />

      <Route path="template" component={Template} />
    </Route>
  </Router>
);

ReactDOM.render(Routing, document.getElementById('root'));
