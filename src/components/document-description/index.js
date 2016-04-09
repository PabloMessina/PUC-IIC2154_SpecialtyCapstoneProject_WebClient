import React, { Component } from 'react';
import { Panel, Col, Grid, Row, ListGroup, ListGroupItem, Navbar, Button, Input } from 'react-bootstrap';

export default class DocumentDescription extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <Panel footer="dededede hdebbdjebdek jdebkjdeb jkdbekjdbe kjdbjdbkjebd dddddddddde eedddddddddd ddddddeddddd dddddddddddd dddddddddd">
        <Row className="show-grid">
             <Col xs={6} md={4}>
              <Image src="/img/atlas1.jpg" responsive/>
             </Col>
             <Col xs={6} md={8}>
               <h3>Title</h3>
               <p>Author: Victor</p>
               <p>Year: 2016</p>
               <p>Category: anatomy</p>
             </Col>
        </Row>
        </Panel>
      </div>
    );
  }
}
