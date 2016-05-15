import React, { Component } from 'react';
import AtlasThumbnail from './atlas-thumbnail';

export default class AtlasGrid extends Component {

  static get defaultProps() {
    return {
      atlases: [],
      organization: 'all',
    };
  }

  // Two important props: tags (atlas with the tags) and organization

  constructor(props) {
    super(props);
    this.state = {
      atlases: [],
      lista: [],
    };
    this.renderGridElement = this.renderGridElement.bind(this);
  }

  renderGridElement(element, i) {
    return (
      <div key={i} style={styles.column} xs={2} md={3}>
        <AtlasThumbnail id={element.id} document={element} />
      </div>
    );
  }

  render() {
    return (
      <div style={styles.scroll}>
        {this.props.atlases.map((element, i) => this.renderGridElement(element, i))}
      </div>
    );
  }
}

AtlasGrid.propTypes = {
  children: React.PropTypes.object,
  atlases: React.PropTypes.array,
};

const styles = {
  scroll: {
    display: 'block',
    margin: 'auto',
    width: '88%',
  },
};
