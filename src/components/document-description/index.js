import React, { Component } from 'react';
import { Grid, Image, Panel, Col, Row, Button } from 'react-bootstrap';
import app from '../../app';
import { Colors } from '../../styles';
import { browserHistory } from 'react-router';
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
    let image = doc.cover.url;
    const route = `/editor/${doc.id}/`;
    image = image || 'http://sightlinemediaentertainment.com/wp-content/uploads/2015/09/placeholder-cover.jpg';
    return (
      <Grid>
        <Panel style={styles.panel} footer={doc.description}>
          <Row className="show-grid">
            <Col xs={6} md={4}>
              <Image src={image} responsive />
            </Col>
            <Col xs={6} md={8}>
              <h3>{doc.title}</h3>
              <p>Year: 'Date of creation'</p>
              <p>Tags: 'Here will be the tags of the atlas</p>
              <p>{doc.tags}</p>
              <Button style={styles.button} onClick={() => browserHistory.push(route)}>
                Go to Atlas
              </Button>
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

const styles = {
  panel: {
    marginTop: 20,
  },
  button: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
  },
};

// this.props.params.docId
