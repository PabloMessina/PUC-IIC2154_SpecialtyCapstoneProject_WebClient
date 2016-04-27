import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ReactQuill from 'react-quill';

export default class AtlasSection extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
      content: React.PropTypes.array,
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
    this.onChange = this.onChange.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return JSON.stringify(nextProps.content) !== JSON.stringify(this.props.content);
  }

  onChange(content) {
    if (JSON.stringify(content.ops) !== JSON.stringify(this.props.content)) {
      this.props.onChangeContent(content.ops);
    }
  }

  render() {
    const toolbar = this.props.static ? [] : ReactQuill.Toolbar.defaultItems;
    return (
      <div style={styles.container}>

        <ReactQuill
          theme="snow"
          value={{ ops: this.props.content }}
          readOnly={this.props.static}
          onChange={this.onChange}
        >

          <ReactQuill.Toolbar
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
    display: 'flex',
    height: '100%',
  },
  editor: {
    overflow: 'scroll',
  },
};
