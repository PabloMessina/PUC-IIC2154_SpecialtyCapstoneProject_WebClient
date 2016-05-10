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

    return (
      <div>
        <BlockControls
          editorState={editorState}
          onChange={this.onChange}
        />
        <InlineControls
          editorState={editorState}
          onChange={this.onChange}
        />
        <div onClick={this.focus}>
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

