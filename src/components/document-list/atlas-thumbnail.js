import React, { PropTypes, Component } from 'react';
import { Panel, Image } from 'react-bootstrap';
import { withRouter } from 'react-router';

class AtlasThumbnail extends Component {

  static get propTypes() {
    return {
      document: PropTypes.object,
      router: PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      document: {
        url: 'img/GILROYFICHA.jpg',
        title: '',
      },
    };
  }

  render() {
    const route = `/documents/${this.props.document.id}`;
    const doc = this.props.document;
    const image = doc.cover.url || 'http://sightlinemediaentertainment.com/wp-content/uploads/2015/09/placeholder-cover.jpg';
    let tags = doc.tags || [];
    if (tags.length === 0) {
      tags = 'No tags';
    } else {
      tags = tags.map((element) => `${element} `);
    }
    return (
      <Panel style={styles.box} onClick={() => this.props.router.push(route)}>
        <Image style={styles.image} src={image} thumbnail responsive />
        <div style={styles.texts}>
          <p style={styles.name}>{doc.title}</p>
        </div>
        <div style={styles.texts}>
          <p style={styles.author}>{tags}</p>
        </div>
      </Panel>
    );
  }
}

export default withRouter(AtlasThumbnail);

const styles = {
  image: {
    width: '100%',
    height: 210,
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
    cursor: 'pointer',
  },
  name: {
    whiteSpace: 'nowrap',
    fontSize: 20,
    margin: 0,
    backgroundImage: 'linear-gradient(left, rgba(255,255,255,0) 0%, white 80%, white 100%',
  },
  texts: {
    width: '100%',
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
