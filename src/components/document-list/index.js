import React, { Component } from 'react';
import { Col, Row, ListGroup, ListGroupItem, Input, ButtonInput, Label } from 'react-bootstrap';
import AtlasThumbnail from './atlas-thumbnail';
import atlasExample from '../../atlas-example.js';

// import renderIf from 'render-if';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class Settings extends Component {

  static get defaultProps() {
    return {
      message: 'Template',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const lista = [];
    atlasExample.documents.forEach((doc, i) => {
      if (i % 4 === 0) {
        lista.push(
          <div>
            <Col xs={2} md={3}>
              <AtlasThumbnail id={ doc.id} document ={doc} />
            </Col>
          </div>
        );
      }
      else {
        lista.push(
          <Col xs={2} md={3}>
            <AtlasThumbnail document ={doc} />
          </Col>
        );
      }
    });
    return (
      <div>
      <Row>
        <Col md={2} style={styles.fixed}>
          <p style={styles.title}>Tags</p>
          <ListGroup style={styles.list}>
            <ListGroupItem href="#" style={styles.list}>
              <h4><Label bsStyle="primary">Anatomia</Label></h4>
            </ListGroupItem>
            <ListGroupItem href="#">
              <h4><Label bsStyle="info">Tag2</Label></h4></ListGroupItem>
            <ListGroupItem href="#">
              <h4><Label bsStyle="info">Tag3</Label></h4>
            </ListGroupItem>
            <ListGroupItem href="#">
              <h4><Label bsStyle="success">Tag4</Label></h4>
            </ListGroupItem>
            <ListGroupItem href="#" style={styles.list}>
              <h4><Label bsStyle="success">Tag5</Label></h4>
            </ListGroupItem>
          </ListGroup>
        </Col>
        <Col md={10} style={styles.scroll}>
        <h1>Atlas</h1>
          <Row>
            <form>
              <Col sm={6} md={5}>
                <Input type="text" ref="input" onChange={this.handleChange} />
              </Col>
              <Col sm={6} md={2}>
                <ButtonInput bsSize="small">Search</ButtonInput>
              </Col>
            </form>
          </Row>
          <Row className="show-grid">
          {lista}
          </Row>
        </Col>
      </Row>
      </div>
    );
  }
}

Settings.propTypes = {
  children: React.PropTypes.object,
};


/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  fixed: {
    width: '25%',
  },
  scroll: {
    left: 'auto',
    float: 'left',
    width: '75%',
  },
  title: {
    fontSize: 25,
  },
  list: {
    borderRadius: 0,
  },
};
