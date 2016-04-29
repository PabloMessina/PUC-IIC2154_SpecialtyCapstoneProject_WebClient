import React, { Component } from 'react';
import Rater from 'react-rater';
import { Panel, Image } from 'react-bootstrap';
import { browserHistory } from 'react-router';

export default class AtlasThumbnail extends Component {

  render() {
    const route = `/documents/${this.props.document.id}`;
    const doc = this.props.document;
    let image = doc.cover.url;
    image = image || 'http://sightlinemediaentertainment.com/wp-content/uploads/2015/09/placeholder-cover.jpg';
    return (
      <Panel style={styles.box} onClick={() => browserHistory.push(route)}>
        <Image style={styles.image} src={image} thumbnail responsive />
        <div style={styles.texts}>
          <p style={styles.name}>{doc.title}</p>
        </div>
        <div style={styles.texts}>
          <p style={styles.author}>{doc.tags}</p>
        </div>
        <Rater total={5} rating={2} />
      </Panel>
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
    height: 200,
  },
  box: {
    float: 'left',
    minWidth: 150,
    maxWidth: 190,
    height: '100%',
    alignItems: 'center',
    hover: 'true',
    borderRadius: 0,
    top: 5,
    margin: 15,
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
    whiteSpace: 'nowrap',
    backgroundImage: 'linear-gradient(left, rgba(255,255,255,0) 0%, white 80%, white 100%',
    fontSize: 15,
    margin: 0,
  },
};
