import React, { Component } from 'react';
// import Button from 'react-native-button';
// import renderIf from 'render-if';
import Node from './node.js';
import renderIf from 'render-if';


export default class AtlasTree extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
      tree: React.PropTypes.object,
      onSelectSection: React.PropTypes.func,
      onAddSection: React.PropTypes.func,
    };
  }

  render() {
    const tree = this.props.tree;
    return (
      <div style={styles.container}>
        {renderIf(tree.undefined)(() => (
          tree.undefined.map((section, i) => (
            <Node
              key={i}
              static={this.props.static}
              onSelectSection={this.props.onSelectSection}
              onAddSection={this.props.onAddSection}
              section={section}
              tree={tree}
              anidation={[i + 1]}
            />
            ))
        ))}
      </div>
    );
  }
}


const styles = {
  container: {
    backgroundColor: 'white',

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
