import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import AtlasSection from '../atlas-section';
import AtlasTree from '../atlas-tree';
import app from '../../app';

const sectionService = app.service('sections');
const versionService = app.service('versions');

export default class AtlasBook extends Component {

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
      atlasId: props.atlasId,
      sectionId: props.sectionId,
    };
    this.fetchSections = this.fetchSections.bind(this);
    this.onSelectSection = this.onSelectSection.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
  }

  onSelectSection(sectionId) {
    sectionService.get(sectionId).then((section) => {
      this.setState({ section });
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
        <AtlasTree static onSelected={this.onSelected} />

        <AtlasSection sectionId={this.state.sectionId} />
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
