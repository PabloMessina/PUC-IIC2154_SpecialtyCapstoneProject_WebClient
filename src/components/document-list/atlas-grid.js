import React, { Component } from 'react';
import AtlasThumbnail from './atlas-thumbnail';
import app from '../../app';
const atlasesService = app.service('/atlases');

export default class AtlasGrid extends Component {

  static get defaultProps() {
    return {
      atlases: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      atlases: props.atlases,
      advanced: false,
      lista: [],
      tags: [],
      allTags: [
        { label: 'Anatomy', value: 'Anatomy' },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Astronomy', value: 'Astronomy' },
        { label: 'Biology', value: 'Biology' },
        { label: 'Technology', value: 'Technology' },
      ],
    };
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.findOne = this.findOne.bind(this);
    this.filterDocuments = this.filterDocuments.bind(this);
  }

  componentDidMount() {
    this.fetchTree();
  }

  // To fetch the atlases from the server
  fetchTree() {
    const query = {
    };

    return atlasesService.find({ query })
      .then(results => {
        this.setState({ atlases: results.data });
      });
  }
  // To find an atlas with at least one of the tags
  findOne(haystack, arr) {
    return haystack.every(v => arr.indexOf(v.label) >= 0);
  }

  // To handle the changes in the tags
  handleSelectChange(value, tags) {
    this.forceUpdate();
    this.setState({ tags });
    this.state.lista = [];
    this.state.atlases.forEach((doc) => {
      const search = this.findOne(this.state.tags, doc.tags);
      if (search || this.state.tags.length === 0) {
        this.state.lista.push(
          <div style={styles.column} xs={2} md={3}>
            <AtlasThumbnail id={doc.id} document={doc} />
          </div>
        );
      }
    });
  }


  // For the first actualization and when you press the button search
  filterDocuments() {
    this.state.lista = [];
    this.state.atlases.forEach((doc) => {
      const search = this.findOne(this.state.tags, doc.tags);
      if (search || this.state.tags.length === 0) {
        this.state.lista.push(
          <div style={styles.column} xs={2} md={3}>
            <AtlasThumbnail id={doc.id} document={doc} />
          </div>
        );
      }
    });
  }

  render() {
    this.filterDocuments();
    // Use <FormControl type="text" placeholder="" /> instead of Select for simple search
    return (
      <div style={styles.scroll}>
        {this.state.lista}
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
