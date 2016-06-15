import React, { Component } from 'react';
import { RichUtils, Entity, AtomicBlockUtils } from 'draft-js';
import StyleButton from './style-button';

const BLOCK_TYPES = [
  { label: 'Big', blockType: 'header-two' },
  { label: 'Bigger', blockType: 'header-one' },
  //  { label: 'H3', blockType: 'header-three' },
  //  { label: 'H4', blockType: 'header-four' },
  //  { label: 'H5', blockType: 'header-five' },
  //  { label: 'H6', blockType: 'header-six' },
  { icon: 'quote-right', blockType: 'blockquote' },
  { icon: 'list-ul', blockType: 'unordered-list-item' },
  { icon: 'list-ol', blockType: 'ordered-list-item' },
  { icon: 'code', blockType: 'code-block' },
  { icon: 'headphones', blockType: 'audio' },
  { icon: 'image', blockType: 'image' },
  { icon: 'video-camera', blockType: 'video' },
  { icon: 'cube', blockType: 'model' },
  { icon: 'tags', blockType: 'imageWithLabels' },
  { label: 'TeX', blockType: 'latex' },
];

export default class BlockControls extends Component {
  static get propTypes() {
    return {
      onShowFileModal: React.PropTypes.func.isRequired,
      onCloseFileModal: React.PropTypes.func.isRequired,
      editorState: React.PropTypes.object,
      onChange: React.PropTypes.func.isRequired,
    };
  }

  constructor(props) {
    super(props);
    this.addMedia = this.addMedia.bind(this);
    this.onBlockToggle = this.onBlockToggle.bind(this);
  }

  addMedia(type) {
    const onSuccess = (src) => {
      const entityKey = Entity.create(type, 'IMMUTABLE', { src });

      // Here the media is inserted
      AtomicBlockUtils.insertAtomicBlock(
        this.props.editorState,
        entityKey,
        ' '
      );
    };

    this.props.onShowFileModal({ type, onSuccess });
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

  add2D() {
    const entityKey = Entity.create(
      'imageWithLabels',
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
      case 'imageWithLabels':
        state = this.add2D();
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
