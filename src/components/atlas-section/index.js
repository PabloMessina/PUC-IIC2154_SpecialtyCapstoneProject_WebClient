import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import renderIf from 'render-if';
import RichEditor from '../rich-editor';

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
  }

  // Only update if contents or title have changed
  shouldComponentUpdate(nextProps) {
    const contentChanged = !_.isEqual(nextProps.section.content, this.props.section.content);
    const titleChanged = !_.isEqual(nextProps.section.title, this.props.section.title);

    return true;
    return contentChanged || titleChanged;
  }

  onChangeContent(content) {
    if (!_.isEqual(content.ops, this.props.section.content)) {
      this.props.onChangeContent(content.ops);
    }
  }

  onChangeTitle(event) {
    const title = event.target.value;
    if (!_.isEqual(title, this.props.section.title)) {
      this.props.onChangeTitle(title);
    }
  }

  toolbarItems() {
    // const items = {};
  }

  render() {
    const section = this.props.section;

    return (
      <div style={styles.container}>

        {renderIf(section.title)(() => (
          <input style={styles.title} onChange={this.onChangeTitle} value={section.title} />
        ))}

        <RichEditor />
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
