import React, { Component } from 'react';
import { Col, Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import AtlasThumbnail from './atlas-thumbnail';
import InfiniteGrid from 'react-infinite-grid';
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
          url: 'img/GILROYFICHA.jpg',
          title: 'Atlas 2',
        },
        {
          url: 'img/GILROYFICHA.jpg',
          title: 'Atlas 2',
        },
        {
          url: 'img/GILROYFICHA.jpg',
          title: 'Atlas 2',
        },
        {
          url: 'img/GILROYFICHA.jpg',
          title: 'Atlas 2',
        },
        {
          url: 'img/GILROYFICHA.jpg',
          title: 'Atlas 2',
        },
        {
          url: 'img/GILROYFICHA.jpg',
          title: 'Atlas 2',
        },
      ],
    };
  }

  render() {
    const lista = [];
    this.state.documents.forEach((doc, i) => {
        lista.push(<Col xs={3} md={3}><AtlasThumbnail doument ={doc}></AtlasThumbnail></Col>);
      if(i % 4 === 0) {
        lista.push(<div><Col xs={3} md={3}><AtlasThumbnail doument ={doc}></AtlasThumbnail></Col></div>);
      }
    })
    return (
      <div>
        <Grid>
          <Row className="show-grid">
          {lista}
          </Row>
        </Grid>
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
