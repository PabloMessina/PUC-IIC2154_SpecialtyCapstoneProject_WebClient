import React from 'react';
import {
  Entity,
} from 'draft-js';

const Audio = (props) => {
  return <audio controls src={props.src} style={styles.media} />;
};

const Image = (props) => {
  return <img src={props.src} style={styles.media} />;
};

const Video = (props) => {
  return <video controls src={props.src} style={styles.media} />;
};

const styles = {
  media: {
    width: '60%',
  },
};

const blocks = {
  audio: { component: Audio, editable: false },
  image: { component: Image, editable: false },
  video: { component: Video, editable: false },
  // 3d: { component: 3DView, editable: false },
  // 3d-video: { component: 3DVideo, editable: false },
  // You can see where this is going :)
};

const Block = (props) => {
  const entity = Entity.get(props.block.getEntityAt(0));
  const componentProps = entity.getData();
  const type = entity.getType();
  const { component } = blocks[type];

  return component(componentProps);
};

export const blockRenderer = (block) => {
  // const editable = blocks[type].editable;
  if (block.getType() === 'atomic') {
    return {
      component: Block,
      editable: false,
    };
  }

  return null;
};
