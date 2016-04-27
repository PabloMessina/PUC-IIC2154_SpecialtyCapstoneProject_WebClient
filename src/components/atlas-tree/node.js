import React, { Component } from 'react';
import Icon from 'react-fa';
import renderIf from 'render-if';
import app from '../../app.js';
// import Icon from 'react-fa';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import StyleSheet from 'react-native-debug-stylesheet';
// import StyleSheet from 'react-native-debug-stylesheet';
// import { Colors } from '../../styles';

const sectionService = app.service('/sections');

const FONT = {
  MIN: 10,
  MAX: 20,
  DELTA: 2,
};

export default class Node extends Component {

  static get propTypes() {
    return {
      style: React.PropTypes.any,
      tree: React.PropTypes.object,
      root: React.PropTypes.bool,
      onSelectSection: React.PropTypes.func,
      onAddSection: React.PropTypes.func,
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
      selected: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tree: props.tree,
      collapsed: props.collapsed,
      section: props.section,
      selected: props.selected,
      hover: false,
    };

    this.collapse = this.collapse.bind(this);
    this.addSection = this.addSection.bind(this);
  }

  collapse() {
    this.setState({ collapsed: !this.state.collapsed });
  }


  addSection() {
    const section = this.state.section;
    const newSection = {
      versionId: section.versionId,
      parentId: section._id,
    };

    sectionService.create(newSection)
    .then(result => {
      this.props.onAddSection(result);
    })
    .catch(error => console.log(error));
  }

  onClick() {
    this.props.onSelectSection(this.state.section);
    // this.setState({ selected: true })
  }


  render() {
    
    const { anidation, root, tree } = this.props;
    const { hover, selected, collapsed, section} = this.state;
    const { _id, title } = section;

    const sections = tree[_id];
    const onSelectSection = () => this.props.onSelectSection(section);
    const hoverStyle = hover || selected ? { color: 'blue' } : { color: '#4A4A4A' };

    const hasSubtree = sections && sections.length > 0 && !collapsed;
    // const fontSize = Math.max(FONT.MAX - (FONT.DELTA * anidation.length), FONT.MIN);

    return (
      <div style={styles.container}>

        {renderIf(root)(() => (
          <span style={styles.title}>{title}</span>
        ))}

        {renderIf(!root)(() => (
          <span
            style={Object.assign(styles.sectionNav, hoverStyle)}
            onMouseEnter={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
          >
            <span
              onClick={onSelectSection}
            >
              <span style={styles.anidation}>{anidation.join('.')}.</span> {title}
            </span>

            {renderIf(!this.props.static)(() => (
              <Icon name="plus" style={styles.plusIcon} onClick={this.addSection} />
              ))
            }
          </span>
        ))}

        {renderIf(hasSubtree)(() => (
          <div style={styles.subtree}>
            {sections.map((section, i) => (
              <Node
                key={i}
                static={this.props.static}
                onSelectSection={this.props.onSelectSection}
                onAddSection={this.props.onAddSection}
                section={section}
                tree={this.props.tree}
                anidation={[...anidation, i + 1]}
              />
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
    marginRight: 15,
    width: '100%',
  },
  title: {
    display: 'inline-block',
    width: '100%',
    fontSize: 22,
    textAlign: 'center',
  },
  subtree: {
    // height: 30,
  },
  addSection: {


  },
  plusIcon: {
    marginLeft: 10,
    fontSize: 12,
    alignSelf: 'center',
    alignItems: 'center',
  },
  sectionNav: {
    display: 'inline-block',
    padding: '5px 0',
    alignItems: 'center',
    fontSize: 18,
    width: '100%',
  },
  anidation: {
    fontWeight: 'bold',
  },
};

