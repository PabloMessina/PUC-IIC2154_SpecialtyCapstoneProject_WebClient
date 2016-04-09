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
          <Image src={this.props.document.url} thumbnail responsive />
        </div>
        <h4>{this.props.document.title}</h4>
        <h3>{this.props.document.author}</h3>
        <Rater total={5} rating={2}/>
      </Jumbotron>
    );
  }
}

AtlasThumbnail.defaultProps = {
  document: {
    url: 'img/GILROYFICHA.jpg',
    title: '',
  },
};

const styles = {
  container: {
    width: 134,
    height: 200,
  },
  box: {
    hover: 'true',
    borderRadius: 0,
    top: 5,
    margin: 10,
    padding: 30,
    border: 15,
  },
};
