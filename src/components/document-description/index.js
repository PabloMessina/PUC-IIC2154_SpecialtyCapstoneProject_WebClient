import React, { Component } from 'react';
import { Grid, Image, Panel, Col, Row } from 'react-bootstrap';
import atlasExample from '../../atlas-example.js';

export default class DocumentDescription extends Component {

  render() {
    const doc = atlasExample.documents[this.props.params.docId - 1];
    return (
      <Grid>
        <Panel footer="Footer">
          <Row className="show-grid">
            <Col xs={6} md={4}>
              <Image src="/img/atlas1.jpg" src={`/${doc.url}`} responsive />
            </Col>
            <Col xs={6} md={8}>
              <h3>{doc.title}</h3>
              <p>Author: {doc.author}</p>
              <p>Year: 2016</p>
              <p>Category: anatomy</p>
            </Col>
          </Row>
        </Panel>
      </Grid>
    );
  }
}

DocumentDescription.propTypes = {
  params: React.PropTypes.number,
};

// this.props.params.docId
