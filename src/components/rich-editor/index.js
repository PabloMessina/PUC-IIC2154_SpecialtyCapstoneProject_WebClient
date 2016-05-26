import React, { PropTypes, Component } from 'react';
import {
  convertToRaw,
  convertFromRaw,
  Editor,
  EditorState,
  RichUtils,
} from 'draft-js';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import styleMap from './inline-styles';
import BlockControls from './controls/block-controls';
import Decorator from './decorator';
import Toolbar from './components/toolbar';
import renderIf from 'render-if';
import { createBlockRenderer } from './block-renderer';

export default class RichEditor extends Component {

  static get propTypes() {
    return {
      style: PropTypes.object,
      content: PropTypes.object,
      contentKey: PropTypes.any,
      readOnly: PropTypes.bool,
      onChange: PropTypes.func,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      editorState: props.content
        ? EditorState.push(EditorState.createEmpty(Decorator), convertFromRaw(props.content))
        : EditorState.createEmpty(Decorator),
      editorLocked: false,
    };

    this.blockRenderer = createBlockRenderer(
      (modifier, blockKey) => {
        this.onChange(
          modifier(this.state.editorState, blockKey)
        );
      },
      (state) => {
        this.setState(state);
      },
      () => this.onChange(this.state.editorState),
      props.readOnly
    );

    this.focus = () => this.refs.editor.focus();
    this.onChange = this.onChange.bind(this);

    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.content, nextProps.content) && !isEqual(this.rawContent, nextProps.content)) {
      const content = nextProps.content ? { ...nextProps.content } : {};
      content.entityMap = content.entityMap || new Map();
      this.rawContent = { ...content };
      this.setState({
        editorState: !content || !content.blocks
          ? EditorState.createEmpty()
          : EditorState.push(this.state.editorState, convertFromRaw(content)),
      });
    }
  }

  onChange(editorState) {
    this.setState({ editorState });
    if (this.props.onChange) {
      this.rawContent = convertToRaw(editorState.getCurrentContent());
      this.props.onChange(this.rawContent, editorState);
    }
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
    const { style, readOnly, onScroll } = this.props;
    const { editorState, editorLocked } = this.state;
    return (
      <div style={styles.container}>

        {renderIf(!readOnly)(() => (
          <div style={styles.controls}>
            <BlockControls
              editorState={editorState}
              onChange={editorLocked ? () => {} : this.onChange}
            />
          </div>
        ))}
        <div
          ref="editorContainer"
          onClick={this.focus}
          onScroll={onScroll}
          style={{ ...styles.editor, ...style }}
        >
          <Editor
            blockRendererFn={this.blockRenderer}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            ref="editor"
            spellCheck
            readOnly={readOnly || editorLocked}
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
    paddingTop: 10,
  },
  editor: {
    padding: 50,
    fontSize: 20,
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
