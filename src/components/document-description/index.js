import React, { Component } from 'react';
import { Image, Panel, Col, Grid, Row, ListGroup, ListGroupItem, Navbar, Button, Input } from 'react-bootstrap';
import atlasExample from '../../atlas-example.js';

export default class DocumentDescription extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const doc = atlasExample[this.props.params.docId - 1];
    return (
      <div>
        <Panel footer="dededede hdebbdjebdek jdebkjdeb jkdbekjdbe kjdbjdbkjebd dddddddddde eedddddddddd ddddddeddddd dddddddddddd dddddddddd">
        <Row className="show-grid">
             <Col xs={6} md={4}>
              <Image src="/img/atlas1.jpg" src={ '/' + doc.url }responsive />
             </Col>
             <Col xs={6} md={8}>
               <h3>{ doc.title }</h3>
               <p>Author: { doc.author }</p>
               <p>Year: 2016</p>
               <p>Category: anatomy</p>
             </Col>
        </Row>
        </Panel>
      </div>
    );
  }
}

//this.props.params.docId
