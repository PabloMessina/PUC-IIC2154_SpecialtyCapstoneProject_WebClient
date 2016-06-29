/* eslint no-underscore-dangle:0 */

import React, { PropTypes, Component } from 'react';
import renderIf from 'render-if';
import Icon from 'react-fa';

import { Colors } from '../../styles';


export default class Node extends Component {

  static get propTypes() {
    return {
      style: PropTypes.any,
      tree: PropTypes.object,
      title: PropTypes.string,
      root: PropTypes.bool,
      selectedSectionId: PropTypes.string,
      onSelectSection: PropTypes.func,
      onAddSection: PropTypes.func,
      onRemoveSection: PropTypes.func,
      sectionParentId: PropTypes.string,
      sectionIndex: PropTypes.number,
      level: PropTypes.number,
      anidation: PropTypes.array,
      collapsed: PropTypes.bool,
      readOnly: PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      collapsed: false,
      anidation: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      collapsed: props.collapsed,
      hover: false,
    };

    this.collapse = this.collapse.bind(this);
    this.getSection = this.getSection.bind(this);
  }

  getSection() {
    const { tree, sectionParentId, sectionIndex } = this.props;
    if (!tree[sectionParentId]) return null;

    return tree[sectionParentId][sectionIndex];
  }

  collapse() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const { sectionIndex, sectionParentId, anidation, root, tree, selectedSectionId } = this.props;
    const { hover, collapsed } = this.state;
    const section = this.getSection();
    const { _id, title } = section || { title: this.props.title };

    // Is this section the selected one?
    const selected = selectedSectionId === _id;
    // Subsections
    const subsections = tree[_id];

    const onSelectSection = () => this.props.onSelectSection(sectionParentId, sectionIndex);

    // Change color on mouse hover
    let style = {};
    if (hover) style = { ...style, ...styles.hover };
    if (selected) style = { ...style, ...styles.selected };

    // Only render children if they exist
    const hasSubtree = subsections && subsections.length > 0 && !collapsed;
    const addSection = () => this.props.onAddSection(_id);
    const removeSection = () => this.props.onRemoveSection(section, sectionIndex);

    return (
      <div style={styles.container}>

        {renderIf(root)(() => (
          <span
            onMouseEnter={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
            style={styles.title}
          >
            {title}
            {renderIf(!this.props.readOnly && hover)(() => (
              <Icon name="plus" style={styles.icon} onClick={addSection} />
            ))}
          </span>
        ))}

        {renderIf(root)(<hr />)}

        {renderIf(!root)(() => (
          <span
            style={{ ...styles.sectionNav, ...style }}
            onMouseEnter={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
          >
            <span
              style={{ cursor: 'pointer' }}
              onClick={onSelectSection}
            >
              <span style={styles.anidation}>{anidation.join('.')}.</span> {title}
            </span>

            {renderIf(!this.props.readOnly && hover)(() => (
              <span>
                <Icon name="plus" style={styles.icon} onClick={addSection} />
                <Icon name="trash" style={styles.icon} onClick={removeSection} />
              </span>
            ))}
          </span>
        ))}

        {renderIf(hasSubtree)(() => (
          <div style={styles.subtree}>
            {subsections.map((subsection, i) => (
              <Node
                key={i}
                readOnly={this.props.readOnly}
                selectedSectionId={selectedSectionId}
                onSelectSection={this.props.onSelectSection}
                onAddSection={this.props.onAddSection}
                onRemoveSection={this.props.onRemoveSection}
                sectionParentId={subsection.parentId}
                sectionIndex={i}
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
    padding: '3px 15px',
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
  hover: {
    color: Colors.MAIN,
  },
  selected: {
    color: Colors.MAIN,
    // background: Colors.MAIN,
    // color: Colors.WHITE,
  },
  icon: {
    marginLeft: 10,
    fontSize: 12,
    alignSelf: 'center',
    alignItems: 'center',
    cursor: 'pointer',
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
