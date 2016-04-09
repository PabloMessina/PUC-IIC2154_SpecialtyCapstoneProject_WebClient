import React, { Component } from 'react';
import { Col, Grid, Row, ListGroup, ListGroupItem, Navbar, Button, Input } from 'react-bootstrap';
import { browserHistory } from 'react-router';
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
        },
        {
          url: 'img/atlas1.jpg',
          title: 'Atlas 2',
        },
        {
          url: 'img/atlas2.jpg',
          title: 'Atlas 3',
        },
        {
          url: 'img/atlas3.jpg',
          title: 'Atlas 4',
        },
        {
          url: 'img/atlas4.jpg',
          title: 'Atlas 5',
        },
        {
          url: 'img/atlas5.JPG',
          title: 'Atlas 6',
        },
        {
          url: 'img/atlas6.jpg',
          title: 'Atlas 7',
        },
      ],
    };
  }

  render() {
    const lista = [];
    this.state.documents.forEach((doc, i) => {
      if (i % 4 === 0) {
        lista.push(<div><Col xs={2} md={3}><AtlasThumbnail document ={doc}></AtlasThumbnail></Col></div>);
      }
      else {
        lista.push(<Col xs={2} md={3}><AtlasThumbnail document ={doc}></AtlasThumbnail></Col>);
      }
    });
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form pullLeft>
              <Input type="text" placeholder="Search" />
              {' '}
              <Button type="search">Search</Button>
              </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>
        <Col sm={6} md={2}>
          <h1>Tags</h1>
          <ListGroup>
            <ListGroupItem>Anatomia</ListGroupItem>
            <ListGroupItem>Tag3</ListGroupItem>
            <ListGroupItem>Tag2</ListGroupItem>
            <ListGroupItem>Patologia</ListGroupItem>
            <ListGroupItem>Tag4</ListGroupItem>
          </ListGroup>
        </Col>
        <Col sm={6} md={10}>
          <h1>Atlas</h1>
          <Row className="show-grid">
          {lista}
          </Row>
        </Col>
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
  container: {

  },
};
