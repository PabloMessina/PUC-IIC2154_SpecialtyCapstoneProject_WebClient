import React, { Component } from 'react';
import { Grid, Image, Panel, Col, Row } from 'react-bootstrap';
import app from '../../app';
const atlasesService = app.service('/atlases');


export default class DocumentDescription extends Component {

  static get defaultProps() {
    return {
      atlas: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      atlas: props.atlas,
    };
  }

  componentDidMount() {
    this.fetchTree();
  }

  fetchTree() {
    const query = {
      atlasId: this.props.params.atlasId,
    };

    return atlasesService.find({ query })
      .then(results => {
        this.setState({ atlas: results.data });
      });
  }

  render() {
    const doc = this.props.params.atlas;
    return (
      <Grid>
        <Panel footer={doc.description}>
          <Row className="show-grid">
            <Col xs={6} md={4}>
              <Image src="/img/atlas1.jpg" src={`/${doc.cover}`} responsive />
            </Col>
            <Col xs={6} md={8}>
              <h3>{doc.title}</h3>
              <p>Year: 'Date of creation'</p>
              <p>Category: 'Here will be the tags of the atlas'</p>
            </Col>
          </Row>
        </Panel>
      </Grid>
    );
  }
}

DocumentDescription.propTypes = {
  atlas: React.PropTypes.object,
  params: React.PropTypes.object,
};

// this.props.params.docId
