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
  { icon: 'list-ul', blockType: 'unordered-list-item' },
  { icon: 'list-ol', blockType: 'ordered-list-item' },
  { icon: 'code', blockType: 'code-block' },
  { icon: 'headphones', blockType: 'audio' },
  { icon: 'image', blockType: 'image' },
  { icon: 'video-camera', blockType: 'video' },
  { icon: 'cube', blockType: 'model' },
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

  add3D() {
    const entityKey = Entity.create(
      'model',
      'IMMUTABLE',
      { src: ' ' }
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
      case 'model':
        state = this.add3D();
        break;
      default:
        state = RichUtils.toggleBlockType(this.props.editorState, type);
    }
    this.props.onChange(state);
  }

  render() {
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    const activeBlockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();

    return (
      <div style={styles.controls} >
        {BLOCK_TYPES.map(({ label, icon, blockType }) =>
          <StyleButton
            key={blockType}
            active={blockType === activeBlockType}
            label={label}
            icon={icon}
            onToggle={this.onBlockToggle}
            style={blockType}
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
