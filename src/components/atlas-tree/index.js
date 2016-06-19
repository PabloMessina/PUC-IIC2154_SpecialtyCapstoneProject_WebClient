import React, { PropTypes } from 'react';
import renderIf from 'render-if';

import Node from './node.js';

const AtlasTree = ({
  title,
  tree,
  versionId,
  selectedSectionId,
  readOnly,
  onSelectSection,
  onAddSection,
  onRemoveSection,
  ...props,
}) => (
  <div style={styles.container} {...props}>
    {renderIf(tree)(() => (
      <Node
        root
        title={title}
        tree={tree}
        versionId={versionId}
        readOnly={readOnly}
        selectedSectionId={selectedSectionId}
        onSelectSection={onSelectSection}
        onAddSection={onAddSection}
        onRemoveSection={onRemoveSection}
      />
    ))}
  </div>
);

AtlasTree.propTypes = {
  readOnly: PropTypes.bool,
  title: PropTypes.string,
  tree: PropTypes.object,
  versionId: PropTypes.string.isRequired,
  selectedSectionId: PropTypes.string,
  onSelectSection: PropTypes.func,
  onAddSection: PropTypes.func,
  onRemoveSection: PropTypes.func,
};

export default AtlasTree;

const styles = {
  container: {
    backgroundColor: 'white',
    overflow: 'scroll',
    width: '20%',
    top: 64,
    bottom: 35,
    paddingTop: 20,
    position: 'absolute',
    borderRight: '1px solid rgba(0,0,0,0.07)',

    // flexDirection: 'column', // row, column
    // flexWrap: 'nowrap' // wrap, nowrap
    // alignItems: 'center', // flex-start, flex-end, center, stretch
    // alignSelf: 'auto', // auto, flex-start, flex-end, center, stretch
    // justifyContent: 'center', // flex-start, flex-end, center, space-between, space-around
    // position: 'relative', // absolute, relative
    // backgroundColor: 'white',
    // margin: 0,
    // padding: 0,
    // right: 0,
    // top: 0,
    // left: 0,
    // bottom: 0,
  },
};
