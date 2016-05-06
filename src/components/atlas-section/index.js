import React, { Component } from 'react';
import ReactQuill from 'react-quill';

import _ from 'lodash';

export default class AtlasSection extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
      section: React.PropTypes.object,
      onChangeTitle: React.PropTypes.func,
      onChangeContent: React.PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      static: false,
    };
  }

  constructor(props) {
    super(props);
    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onTitleLostFocus = this.onTitleLostFocus.bind(this);
  }

  // Only update if contents or title have changed
  shouldComponentUpdate(nextProps) {
    const contentChanged = !_.isEqual(nextProps.section.content, this.props.section.content);
    const titleChanged = !_.isEqual(nextProps.section.title, this.props.section.title);

    return contentChanged || titleChanged;
  }

  onChangeContent(content) {
    if (!_.isEqual(content.ops, this.props.section.content)) {
      this.props.onChangeContent(content.ops);
    }
  }

  onChangeTitle(event) {
    const title = event.target.value;

    if (title !== this.props.section.title) {
      this.props.onChangeTitle(title);
    }
  }

  onTitleLostFocus() {
    if (this.props.section.title === '') {
      this.props.onChangeTitle('Untitled');
    }
  }

  toolbarItems() {
    // const items = {};
  }

  render() {
    const section = this.props.section;

    const toolbar = this.props.static ? [] : ReactQuill.Toolbar.defaultItems;

    return (
      <div style={styles.container}>

        <input
          style={styles.title}
          onChange={this.onChangeTitle}
          onBlur={this.onTitleLostFocus}
          value={section.title}
        />

        <ReactQuill
          theme="snow"
          value={{ ops: section.content }}
          readOnly={this.props.static}
          onChange={this.onChangeContent}
        >

          <ReactQuill.Toolbar
            style={styles.bar}
            key="toolbar"
            ref="toolbar"
            items={toolbar}
          />


          <div
            style={styles.editor}
            key="editor"
            ref="editor"
            className="quill-contents"
          />

        </ReactQuill>
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'absolute',
    width: '80%',
    right: 0,
    bottom: 170,
    top: 64,
  },
  title: {
    outline: 'none',
    border: 'none',
    padding: 16,
    fontWeight: 'bold',
    fontSize: 30,
    width: '100%',
  },
  bar: {
    backgroundColor: 'white',
    width: '100%',
    zIndex: 1,
    borderBottom: '1px solid rgba(0,0,0,0.07)',
  },
  editor: {
    fontSize: '20',
    overflow: 'auto',
    position: 'absolute',
    width: '100%',
    height: '100%',
    right: 0,
  },
};
