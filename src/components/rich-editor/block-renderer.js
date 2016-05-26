import Renderer3DWrapper from '../renderer-3d-wrapper';
import ImageWithLabelsWrapper from '../image-with-labels-wrapper';
import Latex from './components/latex';
import { Image, Audio, Video } from './components/media';
import { removeTeXBlock } from './modifiers/tex-modifiers';
import {
  Entity,
} from 'draft-js';


export const createBlockRenderer = (modifyBlock, setState, updateEditor, readOnly) => {
  const getBlock = (type, props) => {
    const blocks = {
      audio: { component: Audio, editable: false },
      image: { component: Image, editable: false },
      video: { component: Video, editable: false },
      latex: {
        component: Latex,
        editable: false,
        props: {
          readOnly,
          onChange: updateEditor,
          onStartEdit: () => setState({ editorLocked: true }),
          onFinishEdit: () => setState({ editorLocked: false }),
          onRemove: (blockKey) => modifyBlock(removeTeXBlock, blockKey),
        },
      },
      model: {
        component: Renderer3DWrapper,
        editable: false,
        props: {
          readOnly,
          gotFocusCallback: () => setState({ editorLocked: true }),
          lostFocusCallback: () => setState({ editorLocked: false }),
        },
      },
      imageWithLabels: {
        component: ImageWithLabelsWrapper,
        editable: false,
      },
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
