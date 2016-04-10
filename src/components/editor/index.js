import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ReactQuill from 'react-quill';


export default class Editor extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      static: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      text: 'Hola <b>Value</b>',
    };
    this.onTextChange = this.onTextChange.bind(this);
  }

  onTextChange(value) {
    if (!this.props.static) {
      this.setState({ text: value });
    }
  }

  render() {
    const toolbar = this.props.static ? [] : ReactQuill.Toolbar.defaultItems;
    return (
      <div style={styles.container}>
        <ReactQuill
          theme="snow"
          value={this.state.text}
          readOnly={this.props.static}
          onChange={this.onTextChange}
        >

          <ReactQuill.Toolbar
            key="toolbar"
            ref="toolbar"
            items={toolbar}
          />

          <Panel key="editor" ref="editor" className="quill-contents">
            <div dangerouslySetInnerHTML={{ __html: this.state.text }} />
          </Panel>

        </ReactQuill>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
