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

  onBlockToggle(type) {
    switch (type) {
      case 'audio':
      case 'image':
      case 'video':
        this.addMedia(type);
        break;
      case 'latex':
        this.addLatex();
        break;
      case 'model':
        this.add3D();
        break;
      case 'imageWithLabels':
        this.add2D();
        break;
      default:
        this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, type));
    }
  }

  addMedia(type) {
    const onSuccess = (urls) => {
      let editorState = this.props.editorState;
      urls.forEach((url) => {
        const entityKey = Entity.create(type, 'IMMUTABLE', { src: url });
        // Here the media is inserted
        editorState = AtomicBlockUtils.insertAtomicBlock(
          editorState,
          entityKey,
          ' '
        );
      });
      this.props.onChange(editorState);
    };
    this.props.onShowFileModal({ type, multiple: true, acceptedFiles: `${type}/*`, onSuccess });
  }

  addLatex() {
    const entityKey = Entity.create(
      'latex',
      'IMMUTABLE',
      { content: 'Click\\ me...' }
    );

    this.props.onChange(AtomicBlockUtils.insertAtomicBlock(
      this.props.editorState,
      entityKey,
      ' '
    ));
  }

  add3D() {
    const editorState = this.props.editorState;
    const onSuccess = (urls) => {
      const zipUrl = urls[0];
      const entityKey = Entity.create('model', 'IMMUTABLE', { source: { zipUrl }, metadata: {} });
      // Here the media is inserted
      this.props.onChange(AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' '
      ));
    };

    this.props.onShowFileModal({
      type: 'model',
      zip: true,
      multiple: true,
      acceptedFiles: '.mtl,.obj,image/*',
      maxFiles: 10,
      onSuccess,
    });
  }

  add2D() {
    const type = 'imageWithLabels';
    const onSuccess = (urls) => {
      let editorState = this.props.editorState;
      urls.forEach((url) => {
        const entityKey = Entity.create(type, 'IMMUTABLE', { source: { url }, metadata: {} });

        // Here the media is inserted
        editorState = AtomicBlockUtils.insertAtomicBlock(
          editorState,
          entityKey,
          ' '
        );
      });
      this.props.onChange(editorState);
    };
    this.props.onShowFileModal({ type, multiple: true, acceptedFiles: 'image/*', onSuccess });
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
