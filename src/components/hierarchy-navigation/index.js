import React, { Component } from 'react';
// import Button from 'react-native-button';
// import renderIf from 'render-if';
import Node from './node.js';

/*
  Component life-cycle:
  https://facebook.github.io/react/docs/component-specs.html
 */

export default class SectionTree extends Component {

  constructor(props) {
    super(props);
    this.state.sections = props.sections;
    this.handleClick = this.handleClick.bind(this);
  }

  render() {
    return (
      <div style={styles.container}>
        {this.state.sections.map((section, i) => (
          <Node key={i} static={this.props.static} onSelected={this.props.onSelected} section={section} anidation={[i + 1]} />
          ))}
      </div>
    );
  }
}


const styles = {
  container: {
    paddingTop: 64,
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
