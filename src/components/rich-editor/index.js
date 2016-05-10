import React, { Component } from 'react';
import {
  convertToRaw,
  Editor,
  EditorState,
  RichUtils,
} from 'draft-js';
import styleMap from './inline-styles';
import InlineControls from './inline-controls.js';
import BlockControls from './block-controls';
import { createBlockRenderer } from './block-renderer.js';

export default class RichEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editorState: EditorState.createEmpty(),
    };

    this.blockRenderer = createBlockRenderer(
      (modifier, blockKey) => {
        this.onChange(
          modifier(this.state.editorState, blockKey)
        );
      }
    );

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => this.setState({ editorState });

    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }

  handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  render() {
    const { editorState } = this.state;
    console.log(editorState.getCurrentContent())
    console.log(convertToRaw(editorState.getCurrentContent()))

    return (
      <div style={styles.container}>
        <div style={styles.controls}>
          <InlineControls
            editorState={editorState}
            onChange={this.onChange}
          />
          <BlockControls
            editorState={editorState}
            onChange={this.onChange}
          />
        </div>
        <div
          onClick={this.focus}
          style={styles.editor}
        >
          <Editor
            blockRendererFn={this.blockRenderer}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            ref="editor"
            spellCheck
          />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
  },
  editor: {
    padding: 50,
    fontSize: '20',
    overflow: 'auto',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  controls: {
    display: 'flex',
    padding: 20,
    backgroundColor: 'white',
    zIndex: 1,
    borderBottom: '1px solid rgba(0,0,0,0.07)',
  },
};
