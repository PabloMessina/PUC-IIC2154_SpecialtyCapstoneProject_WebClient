import React, { PropTypes, Component } from 'react';
import {
  convertToRaw,
  convertFromRaw,
  Editor,
  EditorState,
  RichUtils,
} from 'draft-js';
import isEqual from 'lodash/isEqual';
import styleMap from './inline-styles';
import blockStyleFn from './block-styles';
import BlockControls from './controls/block-controls';
import Decorator from './decorator';
import MultiDecorator from 'draftjs-multidecorators';
import PrismDecorator from './prismDecorator';
import Toolbar from './components/toolbar';
import renderIf from 'render-if';
import FileModal from '../file-modal';
import { createBlockRenderer } from './block-renderer';

const decorator = new MultiDecorator([
  PrismDecorator,
  Decorator,
]);

export default class RichEditor extends Component {

  static get propTypes() {
    return {
      style: PropTypes.object,
      saving: PropTypes.bool,
      content: PropTypes.object,
      contentKey: PropTypes.any,
      readOnly: PropTypes.bool,
      onChange: PropTypes.func,
      onScroll: PropTypes.func,
    };
  }

  constructor(props) {
    super(props);


    this.state = {
      editorState: props.content
        ? EditorState.push(EditorState.createEmpty(decorator), convertFromRaw(props.content))
        : EditorState.createEmpty(decorator),
      editorLocked: false,
      showFileModal: false,
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
    this.showFileModal = this.showFileModal.bind(this);
    this.closeFileModal = this.closeFileModal.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.content, nextProps.content) && !isEqual(this.rawContent, nextProps.content)) {
      const content = nextProps.content ? { ...nextProps.content } : {};
      content.entityMap = content.entityMap || new Map();
      this.rawContent = { ...content };
      this.setState({
        editorState: !content || !content.blocks
          ? EditorState.createEmpty(decorator)
          : EditorState.push(this.state.editorState, convertFromRaw(content)),
      });
    }
  }

  onChange(editorState) {
    if (!editorState) return;
    this.setState({ editorState });
    if (this.props.onChange) {
      this.rawContent = convertToRaw(editorState.getCurrentContent());
      this.props.onChange(this.rawContent, editorState);
    }
  }

  showFileModal(props) {
    this.setState({ showFileModal: true, fileModalProps: props });
  }

  closeFileModal(processFiles) {
    // this.focus();
    this.setState({ showFileModal: false, fileModalProps: {} }, () => {
      this.focus();
      if (processFiles) processFiles();
    });
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
    const { style, saving, readOnly, onScroll } = this.props;
    const { editorState, editorLocked, showFileModal, fileModalProps } = this.state;

    if (!editorState) return null;

    let savingState = null;
    if (saving !== undefined) {
      savingState = (saving) ? 'Saving...' : 'All changes has beed saved';
    }

    return (
      <div style={styles.container}>

        {renderIf(!readOnly)(() => (
          <div style={styles.controls}>
            <BlockControls
              onShowFileModal={this.showFileModal}
              onCloseFileModal={this.closeFileModal}
              editorState={editorState}
              onChange={editorLocked ? () => {} : this.onChange}
            />
            <p style={styles.saving}>{savingState}</p>
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
            blockStyleFn={blockStyleFn}
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
        <FileModal
          show={showFileModal}
          onHide={this.closeFileModal}
          {...fileModalProps}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    paddingTop: 6,
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
    flexDirection: 'row',
    paddingLeft: 20,
    paddingBottom: 5,
    backgroundColor: 'white',
    zIndex: 1,
    borderBottom: '1px solid rgba(0,0,0,0.07)',
  },
  saving: {
    fontWeight: '100',
    marginLeft: 20,
  },
};
