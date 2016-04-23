import React, { Component } from 'react';
import renderIf from 'render-if';
// import Icon from 'react-fa';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import StyleSheet from 'react-native-debug-stylesheet';
// import StyleSheet from 'react-native-debug-stylesheet';
// import { Colors } from '../../styles';

const FONT = {
  MIN: 14,
  MAX: 20,
  DELTA: 2,
};

export default class Node extends Component {

  static get propTypes() {
    return {
      style: React.PropTypes.any,
      tree: React.PropTypes.object,
      onSelectSection: React.PropTypes.func,
      section: React.PropTypes.object,
      level: React.PropTypes.number,
      anidation: React.PropTypes.array,
      collapsed: React.PropTypes.bool,
      static: React.PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      collapsed: false,
      section: { name: 'Untitled', sections: [] },
      anidation: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tree: props.tree,
      collapsed: props.collapsed,
      section: props.section,
    };

    this.collapse = this.collapse.bind(this);
    this.addSection = this.addSection.bind(this);
  }

  collapse() {
    this.setState({ collapsed: !this.state.collapsed });
  }


  addSection() {
    const section = this.state.section;
    if (!section.sections) {
      section.sections = [];
    }

    section.sections.push({ name: 'Section' });
    this.setState({ section });
  }

  render() {
    const { anidation } = this.props;
    const { collapsed } = this.state;
    const section = this.state.section;
    const { _id, title, content } = section;
    const sections = this.state.tree[_id];
    const onSelectSection = () => this.props.onSelectSection(section);

    const hasSubtree = sections && sections.length > 0 && !collapsed;
    const substyle = {
      fontSize: Math.max(FONT.MAX - (FONT.DELTA * anidation.length), FONT.MIN),
    };

    return (
      <div style={styles.container}>

        <div >
          <p style={substyle} onClick={onSelectSection}>
            {anidation.join('.')}. {title}
          </p>
          {renderIf(!this.props.static)(() => (
            <p onClick={this.addSection}>
              +
            </p>
            ))
          }
        </div>

        {renderIf(hasSubtree)(() => (
          <div style={styles.subtree}>
            {sections.map((section, i) => (
              <Node
                key={i}
                static={this.props.static}
                onSelectSection={this.props.onSelectSection}
                section={section}
                tree={this.props.tree}
                anidation={[i + 1]}
              />
              ))}
            ))}
          </div>
        ))}

      </div>
    );
  }
}

const styles = {
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 3,
    marginBottom: 3,
    marginLeft: 15,
  },
  texts: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
  },
  text: {
    marginTop: 3,
    marginBottom: 3,
    fontWeight: '100',
  },
  subtree: {
    // height: 30,
  },
};

