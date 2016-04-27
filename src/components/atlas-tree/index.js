import React, { Component } from 'react';
// import Button from 'react-native-button';
// import renderIf from 'render-if';
import Node from './node.js';
import renderIf from 'render-if';


export default class AtlasTree extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
      title: React.PropTypes.string,
      tree: React.PropTypes.object,
      onSelectSection: React.PropTypes.func,
      onAddSection: React.PropTypes.func,
    };
  }

  render() {
    const { title, tree } = this.props;
    return (
      <div style={styles.container}>
        <Node
          root
          static={this.props.static}
          onSelectSection={this.props.onSelectSection}
          onAddSection={this.props.onAddSection}
          section={{ title, _id: 'undefined' }}
          tree={tree}
        />
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