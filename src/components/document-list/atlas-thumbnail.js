import React, { Component } from 'react';
import Rater from 'react-rater';
import { Jumbotron, Image } from 'react-bootstrap';
import { browserHistory } from 'react-router';

export default class AtlasThumbnail extends Component {

  render() {
    const route = `/documents/${this.props.document.id}`;
    return (
      <Jumbotron style={styles.box} onClick={() => browserHistory.push(route)}>
        <div style={styles.container}>
          <Image style={styles.image} src={this.props.document.url} thumbnail responsive />
        </div>
        <p>{this.props.document.title}</p>
        <p>{this.props.document.author}</p>
        <Rater total={5} rating={2} />
      </Jumbotron>
    );
  }
}

AtlasThumbnail.propTypes = {
  // An optional string prop named "description".
  document: React.PropTypes.object,
};

AtlasThumbnail.defaultProps = {
  document: {
    url: 'img/GILROYFICHA.jpg',
    title: '',
  },
};


const styles = {
  image: {
    width: '100%',
    height: 250,
  },
  container: {
    width: '100%',
    height: '100%',
  },
  box: {
    boxShadow: '2px 2px 5px 0px rgba(0,0,0,0.5)',
    width: 200,
    height: '100%',
    alignItems: 'center',
    hover: 'true',
    borderRadius: 0,
    top: 5,
    padding: 10,
  },
};
