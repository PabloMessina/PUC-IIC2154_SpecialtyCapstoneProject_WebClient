import React from 'react';
import { Col } from 'react-bootstrap';

import AnnouncementsPanel from './panels/announcements';
import EvaluationsPanel from './panels/evaluations';
import CoursesPanel from './panels/courses';

const Academic = () => (
  <div>
    <Col xsHidden sm={2}>
      <CoursesPanel />
    </Col>
    <Col xs={12} sm={10} md={6}>
      <AnnouncementsPanel />
    </Col>
    <Col xs={12} smOffset={2} sm={10} mdOffset={0} md={4}>
      <EvaluationsPanel />
    </Col>
  </div>
);

export default Academic;
