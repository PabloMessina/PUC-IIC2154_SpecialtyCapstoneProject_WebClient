import React, { Component } from 'react';
import { Col, Row, ListGroup, ListGroupItem, Input, ButtonInput, Label } from 'react-bootstrap';
import AtlasThumbnail from './atlas-thumbnail';
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
      documents: [
        {
          url: 'img/GILROYFICHA.jpg',
          title: 'Atlas 1',
          author: 'Juan',
          id: '1',
        },
        {
          url: 'img/atlas1.jpg',
          title: 'Atlas 2',
          author: 'Juan',
          id: '2',
        },
        {
          url: 'img/atlas2.jpg',
          title: 'Atlas 3',
          author: 'Juan',
          id: '3',
        },
        {
          url: 'img/atlas3.jpg',
          title: 'Atlas 4',
          author: 'Juan',
          id: '4',
        },
        {
          url: 'img/atlas4.jpg',
          title: 'Atlas 5',
          author: 'Juan',
          id: '5',
        },
        {
          url: 'img/atlas5.JPG',
          title: 'Atlas 6',
          author: 'Juan',
          id: '6',
        },
        {
          url: 'img/atlas6.jpg',
          title: 'Atlas 7',
          author: 'Juan',
          id: '7',
        },
      ],
    };
  }

  render() {
    const lista = [];
    this.state.documents.forEach((doc, i) => {
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
          <form>
            <Col sm={6} md={2}>
              <Input type="text" ref="input" onChange={this.handleChange} />
            </Col>
            <Col sm={6} md={2}>
              <ButtonInput bsSize="small">Search</ButtonInput>
            </Col>
          </form>
        </Row>
        <Row>
          <Col sm={6} md={2}>
            <h1>Tags</h1>
            <ListGroup style={styles.list}>
              <ListGroupItem onClick='' style={styles.list}><h4><Label bsStyle="primary">Anatomia</Label></h4></ListGroupItem>
              <ListGroupItem><h4><Label bsStyle="info">Tag2</Label></h4></ListGroupItem>
              <ListGroupItem><h4><Label bsStyle="info">Tag3</Label></h4></ListGroupItem>
              <ListGroupItem><h4><Label bsStyle="success">Tag4</Label></h4></ListGroupItem>
              <ListGroupItem style={styles.list}><h4><Label bsStyle="success">Tag5</Label></h4></ListGroupItem>
            </ListGroup>
          </Col>
          <Col sm={6} md={10}>
            <h1>Atlas</h1>
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
  list: {
    borderRadius: 0,
  },
};
