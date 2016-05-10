import React, { Component } from 'react';
import { RichUtils, Entity, AtomicBlockUtils } from 'draft-js';
import StyleButton from './style-button';

const BLOCK_TYPES = [
  { label: 'H1', blockType: 'header-one' },
  { label: 'H2', blockType: 'header-two' },
  { label: 'H3', blockType: 'header-three' },
  { label: 'H4', blockType: 'header-four' },
  { label: 'H5', blockType: 'header-five' },
  { label: 'H6', blockType: 'header-six' },
  { label: 'Blockquote', blockType: 'blockquote' },
  { label: 'UL', blockType: 'unordered-list-item' },
  { label: 'OL', blockType: 'ordered-list-item' },
  { label: 'Code Block', blockType: 'code-block' },
  { label: 'Audio', blockType: 'audio' },
  { label: 'Image', blockType: 'image' },
  { label: 'Video', blockType: 'video' },
  { label: 'Formula', blockType: 'latex' },
];

export default class BlockControls extends Component {
  constructor(props) {
    super(props);
    this.addMedia = this.addMedia.bind(this);
    this.onBlockToggle = this.onBlockToggle.bind(this);
  }

  addMedia(type) {
    const src = window.prompt('Enter a URL');
    if (!src) {
      return null;
    }

    const entityKey = Entity.create(type, 'IMMUTABLE', { src });

    return AtomicBlockUtils.insertAtomicBlock(
      this.props.editorState,
      entityKey,
      ' '
    );
  }

  addLatex() {
    const entityKey = Entity.create(
      'latex',
      'IMMUTABLE',
      { content: 'Click\\ me...' }
    );

    return AtomicBlockUtils.insertAtomicBlock(
      this.props.editorState,
      entityKey,
      ' '
    );
  }

  onBlockToggle(type) {
    let state;
    switch (type) {
      case 'audio':
      case 'image':
      case 'video':
        state = this.addMedia(type);
        break;
      case 'latex':
        state = this.addLatex();
        break;
      default:
        state = RichUtils.toggleBlockType(this.props.editorState, type);
    }
    this.props.onChange(state);
  }

  render() {
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

    return (
      <div style={styles.controls} >
        {BLOCK_TYPES.map((type) =>
          <StyleButton
            key={type.label}
            active={type.blockType === blockType}
            label={type.label}
            onToggle={this.onBlockToggle}
            style={type.blockType}
          />
        )}
      </div>
    );
  }
}

const styles = {
  controls: {

  },
};
