import React, { Component } from 'react';
import Rater from 'react-rater';

export default class AtlasThumbnail extends Component {
  render() {
    return (
      <div style={styles.box}>
        <img src={this.props.document.url} style={styles.container} />
        <p>{this.props.document.title}</p>
        <p>{this.props.document.author}</p>
        <Rater total={5} rating={2} interactive='false'/>
      </div>
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
    width: 320,
    padding: 10,
    border: 5,
    margin: 0,
  },
};
