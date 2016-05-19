import React, { Component } from 'react';
import Icon from 'react-fa';
import renderIf from 'render-if';
import app from '../../app.js';
import { Colors } from '../../styles';

const sectionService = app.service('/sections');

export default class Node extends Component {

  static get propTypes() {
    return {
      style: React.PropTypes.any,
      tree: React.PropTypes.object,
      title: React.PropTypes.string,
      root: React.PropTypes.bool,
      selectedSectionId: React.PropTypes.string,
      onSelectSection: React.PropTypes.func,
      onAddSection: React.PropTypes.func,
      onRemoveSection: React.PropTypes.func,
      versionId: React.PropTypes.string,
      sectionParentId: React.PropTypes.string,
      sectionIndex: React.PropTypes.number,
      level: React.PropTypes.number,
      anidation: React.PropTypes.array,
      collapsed: React.PropTypes.bool,
      readOnly: React.PropTypes.bool,
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
    const hoverStyle = hover || selected ? { color: Colors.MAIN } : { color: '#4A4A4A' };

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

        {renderIf(!root)(() => (
          <span
            style={Object.assign({}, styles.sectionNav, hoverStyle)}
            onMouseEnter={() => this.setState({ hover: true })}
            onMouseLeave={() => this.setState({ hover: false })}
          >
            <span
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
  icon: {
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

