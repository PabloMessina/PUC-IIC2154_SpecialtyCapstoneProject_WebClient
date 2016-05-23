import { Entity } from 'draft-js';

export default function (editorState) {
  const selection = editorState.getSelection();
  const anchorKey = selection.getAnchorKey();
  const contentState = editorState.getCurrentContent();
  const anchorBlock = contentState.getBlockForKey(anchorKey);
  const entityKey = anchorBlock.getEntityAt(selection.anchorOffset);
  if (entityKey) {
    const entity = Entity.get(entityKey);
    return entity.getType();
  }
  return null;
}

