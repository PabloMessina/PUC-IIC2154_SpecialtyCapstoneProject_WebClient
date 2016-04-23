import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import Quill from '../quill';
import SectionTree from '../hierarchy-navigation';
import app from '../../app';

const sectionService = app.service('sections');
const versionService = app.service('versions');

export default class Editor extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
      section: React.PropTypes.object,
      atlasId: React.PropTypes.number,
    };
  }

  static get defaultProps() {
    return {
      static: false,
    };
  }

  fetchSections() {
    return Promise.all(atlas.sections.map(sectionId => sectionService.get(sectionId)))
      .then(sections => this.setState({ sections }));
  }

  constructor(props) {
    super(props);

    this.state = {
      sectionId: props.sectionId,
    };
    this.fetchSections = this.fetchSections.bind(this);
    this.onSelected = this.onSelected.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
  }

  onSelectSection(sectionId) {
    sectionService.get(sectionId).then((section) => {
      this.state.section = section;
    });
  }

  onTextChange(value) {
    if (!this.props.static) {
      this.setState({ text: value });
    }
    console.log(value);
  }

  render() {
    return (
      <div style={styles.container}>
        <SectionTree static onSelected={this.onSelected} />

        <Quill sectionId={this.state.sectionId} content={this.state.content} />
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'nowrap',
    flexDirection: 'row',
  },
};
