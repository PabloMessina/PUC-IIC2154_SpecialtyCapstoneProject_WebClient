import React, { Component } from 'react';
import Rater from 'react-rater';
import { Jumbotron, Image } from 'react-bootstrap';
import { browserHistory } from 'react-router';

export default class AtlasThumbnail extends Component {

  render() {
    const route = `/documents/${this.props.document.id}`;
    return (
      <Jumbotron style={styles.box} onClick={() => browserHistory.push(route)}>
        <Image style={styles.image} src={this.props.document.url} thumbnail responsive />
        <div style={styles.texts}>
          <p style={styles.name}>{this.props.document.title}</p>
        </div>
        <div style={styles.texts}>
          <p style={styles.author}>{this.props.document.author}</p>
        </div>
        <Rater total={5} rating={2} />
      </Jumbotron>
    );
  }
}

AtlasThumbnail.propTypes = {
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
  name: {
    whiteSpace: 'nowrap',
    fontSize: 20,
    margin: 0,
    backgroundImage: 'linear-gradient(left, rgba(255,255,255,0) 0%, white 80%, white 100%',
  },
  texts: {
    maxWidth: '100%',
    maxHeight: '20%',
    overflow: 'hidden',
  },
  author: {
    fontSize: 15,
    margin: 0,
  },
};
