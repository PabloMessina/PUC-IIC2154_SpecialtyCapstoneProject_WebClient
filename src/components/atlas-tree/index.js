import React, { Component } from 'react';
import Node from './node.js';
import renderIf from 'render-if';


export default class AtlasTree extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
      title: React.PropTypes.string,
      tree: React.PropTypes.object,
      versionId: React.PropTypes.string.isRequired,
      selectedSectionId: React.PropTypes.string,
      onSelectSection: React.PropTypes.func,
      onAddSection: React.PropTypes.func,
      onRemoveSection: React.PropTypes.func,
    };
  }

  render() {
    const { title, tree, versionId, selectedSectionId } = this.props;
    return (
      <div style={styles.container}>

        {renderIf(tree)(() => (
          <Node
            root
            title={title}
            tree={tree}
            versionId={versionId}
            static={this.props.static}
            selectedSectionId={selectedSectionId}
            onSelectSection={this.props.onSelectSection}
            onAddSection={this.props.onAddSection}
            onRemoveSection={this.props.onRemoveSection}
          />
        ))}
      </div>
    );
  }
}


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
