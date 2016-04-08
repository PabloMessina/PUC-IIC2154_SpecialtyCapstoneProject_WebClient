import React, { Component } from 'react';

export default class AtlasThumbnail extends Component {
  render() {
    return (
      <div>
        <img src={this.props.document.url} style={styles.container} />
        <p>{this.props.document.title}</p>
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
};
