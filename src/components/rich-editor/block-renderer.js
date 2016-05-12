import React from 'react';
import TeXBlock from './tex-block';
import { removeTeXBlock } from './modifiers/tex-modifiers';
import {
  Entity,
} from 'draft-js';

const Audio = (props) => {
  return <audio controls src={props.blockProps.src} style={styles.media} />;
};

const Image = (props) => {
  return <img src={props.blockProps.src} style={styles.media} />;
};

const Video = (props) => {
  return <video controls src={props.blockProps.src} style={styles.media} />;
};

export const createBlockRenderer = (modifyBlock) => {
  const getBlock = (type, props) => {
    const blocks = {
      audio: { component: Audio, editable: false },
      image: { component: Image, editable: false },
      video: { component: Video, editable: false },
      latex: {
        component: TeXBlock,
        editable: false,
        props: {
          onRemove: (blockKey) => modifyBlock(removeTeXBlock, blockKey),
        },
      },
      model: { component: null, editable: false },
      // 3d-video: { component: 3DVideo, editable: false },
      // You can see where this is going :)
    };
    const block = blocks[type];
    block.props = { ...block.props, ...props };
    return block;
  };

  // Block renderer
  return (block) => {
    if (block.getType() === 'atomic') {
      const entity = Entity.get(block.getEntityAt(0));
      if (entity) {
        const type = entity.getType();
        const props = entity.getData();
        return getBlock(type, props);
      }
    }

    return null;
  };
};

const styles = {
  media: {
    width: '60%',
  },
};
