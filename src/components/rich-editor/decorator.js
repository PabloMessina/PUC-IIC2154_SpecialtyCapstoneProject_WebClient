import Link from './components/link';
import {
  Entity,
  CompositeDecorator,
} from 'draft-js';

function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
          Entity.get(entityKey).getType() === 'link'
      );
    },
    callback
  );
}

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  },
]);

export default decorator;
