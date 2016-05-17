import React, { Component } from 'react';
import {
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  Editor,
  EditorState,
  Entity,
  RichUtils,
} from 'draft-js';
import isEmpty from 'lodash/isEmpty';
import styleMap from './inline-styles';
import InlineControls from './inline-controls';
import BlockControls from './block-controls';
import { createBlockRenderer } from './block-renderer';

export default class RichEditor extends Component {

  constructor(props) {
    super(props);

    const decorator = new CompositeDecorator([
      {
        strategy: findLinkEntities,
        component: Link,
      },
    ]);

    this.state = {
      editorState: EditorState.createEmpty(decorator),
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

    this.promptForLink = this.promptForLink.bind(this);
    this.onURLChange = (e) => this.setState({urlValue: e.target.value});
    this.confirmLink = this.confirmLink.bind(this);
    this.onLinkInputKeyDown = this.onLinkInputKeyDown.bind(this);
    this.removeLink = this.removeLink.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.contentKey === this.props.contentKey) return;

    const content = nextProps.initialContent;

    let editorState = null;
    if (isEmpty(content)) {
      editorState = EditorState.createEmpty();
    } else {
      content.entityMap = content.entityMap || [];
      const contentState = convertFromRaw(content);
      editorState = EditorState.createWithContent(contentState);
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

  promptForLink(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        showURLInput: true,
        urlValue: '',
      }, () => {
        setTimeout(() => this.refs.url.focus(), 0);
      });
    }
  }

  confirmLink(e) {
    e.preventDefault();
    const {editorState, urlValue} = this.state;
    const entityKey = Entity.create('link', 'MUTABLE', {url: urlValue});
    this.setState({
      editorState: RichUtils.toggleLink(
        editorState,
        editorState.getSelection(),
        entityKey
      ),
      showURLInput: false,
      urlValue: '',
    }, () => {
      setTimeout(() => this.refs.editor.focus(), 0);
    });
  }

  onLinkInputKeyDown(e) {
    if (e.which === 13) {
      this.confirmLink(e);
    }
  }

  removeLink(e) {
    e.preventDefault();
    const {editorState} = this.state;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setState({
        editorState: RichUtils.toggleLink(editorState, selection, null),
      });
    }
  }
  
  render() {
    const { editorState } = this.state;

    let urlInput;
    if (this.state.showURLInput) {
      urlInput =
        <div style={styles.urlInputContainer}>
          <input
            onChange={this.onURLChange}
            ref="url"
            style={styles.urlInput}
            type="text"
            value={this.state.urlValue}
            onKeyDown={this.onLinkInputKeyDown}
          />
          <button onMouseDown={this.confirmLink}>
            Confirm
          </button>
        </div>;
    }

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
          <div>
            <button
              onMouseDown={this.promptForLink}
              style={{marginRight: 10}}>
              Add Link
            </button>
            <button onMouseDown={this.removeLink}>
              Remove Link
            </button>
          </div>
          {urlInput}
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

function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
          Entity.get(entityKey).getType() === 'link'
      );
    },
    callback
  );
}

const Link = (props) => {
  const {url} = Entity.get(props.entityKey).getData();
  return (
    <a href={url} style={styles.link}>
      {props.children}
    </a>
  );
};

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
    paddingLeft: 20,
    paddingBottom: 5,
    backgroundColor: 'white',
    zIndex: 1,
    borderBottom: '1px solid rgba(0,0,0,0.07)',
  },
};
