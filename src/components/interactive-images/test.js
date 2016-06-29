import React, { Component } from 'react';
import ImageWithLabelsAtlasWrapper from './with-labels/atlas-wrapper';
// import ImageWithRegions from './with-regions/image-with-regions';

class InteractiveImagesTest extends Component {
  render() {
    return (
      <div>
        <span>IMAGE WITH LABELS ATLAS WRAPPER</span>
        <ImageWithLabelsAtlasWrapper
          blockProps={{
            ...ImageWithLabelsAtlasWrapper.defaultProps.blockProps, mode: 'READONLY',
          }}
        />
      </div>
    );
  }
}
export default InteractiveImagesTest;
