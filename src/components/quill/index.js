import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import SectionTree from '../hierarchy-navigation';
import app from '../../app';

const sectionService = app.service('atlasSections');

export default class Quill extends Component {

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

    this.fetchSections = this.fetchSections.bind(this);
    this.onSelected = this.onSelected.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
  }

  onSelected(sectionId) {
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
    const toolbar = this.props.static ? [] : ReactQuill.Toolbar.defaultItems;
    const content = {};
    content.ops = this.props.section.content;
    return (
      <div style={styles.container}>
        <SectionTree static={this.props.static} onSelected={this.onSelected} />

        <ReactQuill
          theme="snow"
          value={content}
          readOnly={this.props.static}
          onChange={this.onTextChange}
        >

          <ReactQuill.Toolbar
            key="toolbar"
            ref="toolbar"
            items={toolbar}
          />

          <Panel key="editor" ref="editor" className="quill-contents" />

        </ReactQuill>
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
