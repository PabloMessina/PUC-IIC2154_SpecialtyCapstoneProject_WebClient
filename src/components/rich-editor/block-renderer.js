import Renderer3DWrapper from '../renderer-3d-wrapper';
import ImageWithLabelsEditionWrapper from '../image-with-labels-wrappers/edition-wrapper';
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
          mode: readOnly ? 'READONLY' : 'EDITION',
          gotFocusCallback: () => setState({ editorLocked: true }),
          lostFocusCallback: () => setState({ editorLocked: false }),
          onMetadataChanged: () => console.log('===> metadata changed'),
          source: {
            remoteFiles: {
              mtl: 'https://lopezjuri.com/videos/nRBC.mtl',
              obj: 'https://lopezjuri.com/videos/nRBC.obj',
              images: ['https://lopezjuri.com/videos/M_10___Default1.jpg'],
            },
          },
          metadata: { },
        },
      },
      imageWithLabels: {
        component: ImageWithLabelsEditionWrapper,
        editable: false,
        props: {
          // mode: readOnly ? 'READONLY' : 'EDITION',
          source: { url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg' },
          metadata: {},
          gotFocusCallback: () => setState({ editorLocked: true }),
          lostFocusCallback: () => setState({ editorLocked: false }),
          onMetadataChanged: () => console.log('onMetadataChanged()'),
        },
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
