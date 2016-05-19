import React, { Component } from 'react';
import {
  convertToRaw,
  convertFromRaw,
  Editor,
  EditorState,
  RichUtils,
} from 'draft-js';
import isEmpty from 'lodash/isEmpty';
import styleMap from './inline-styles';
import BlockControls from './controls/block-controls';
import Decorator from './decorator';
import Toolbar from './components/toolbar';
import { createBlockRenderer } from './block-renderer';

export default class RichEditor extends Component {

  constructor(props) {
    super(props);


    this.state = {
      editorState: EditorState.createEmpty(Decorator),
      showURLInput: false,
      urlValue: '',
    };

    this.blockRenderer = createBlockRenderer(
      (modifier, blockKey) => {
        this.onChange(
          modifier(this.state.editorState, blockKey)
        );
      }
    );

    this.focus = () => this.refs.editor.focus();
    this.onChange = (editorState) => {
      this.props.onChange(convertToRaw(editorState.getCurrentContent()));
      this.setState({ editorState });
    };

    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.contentKey === this.props.contentKey) return;

    const content = nextProps.initialContent;

    let editorState = null;
    if (isEmpty(content)) {
      editorState = EditorState.createEmpty(Decorator);
    } else {
      content.entityMap = content.entityMap || [];
      const contentState = convertFromRaw(content);
      editorState = EditorState.createWithContent(contentState, Decorator);
    }
    this.setState({ editorState });
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
      <div style={styles.container}>

        <BlockControls
          editorState={editorState}
          onChange={this.onChange}
        />
        <div
          ref="editorContainer"
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
          <Toolbar
            editorState={editorState}
            editor={this.refs.editorContainer}
            onChange={this.onChange}
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
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  controls: {
    display: 'flex',
    paddingLeft: 20,
    paddingBottom: 5,
    backgroundColor: 'white',
    zIndex: 1,
    borderBottom: '1px solid rgba(0,0,0,0.07)',
  },
};
