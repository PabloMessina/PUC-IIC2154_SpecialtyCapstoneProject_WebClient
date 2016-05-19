import Latex from './components/latex';
import { Image, Audio, Video } from './components/media';
import { removeTeXBlock } from './modifiers/tex-modifiers';
import {
  Entity,
} from 'draft-js';


export const createBlockRenderer = (modifyBlock) => {
  const getBlock = (type, props) => {
    const blocks = {
      audio: { component: Audio, editable: false },
      image: { component: Image, editable: false },
      video: { component: Video, editable: false },
      latex: {
        component: Latex,
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
