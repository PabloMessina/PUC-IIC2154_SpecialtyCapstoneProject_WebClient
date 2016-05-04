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
      versionId: React.PropTypes.string,
      sectionParentId: React.PropTypes.string,
      sectionIndex: React.PropTypes.number,
      level: React.PropTypes.number,
      anidation: React.PropTypes.array,
      collapsed: React.PropTypes.bool,
      static: React.PropTypes.bool,
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
    this.addSection = this.addSection.bind(this);
    this.deleteSection = this.deleteSection.bind(this);
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

  addSection() {
    const { versionId, _id } = this.getSection() || { versionId: this.props.versionId };
    const newSection = { versionId };
    if (_id) newSection.parentId = _id;

    sectionService.create(newSection)
    .then(result => {
      this.props.onAddSection(result);
    })
    .catch(error => console.log(error));
  }

  deleteSection() {
    /* const { versionId, parentId } = this.getSection() || { versionId: this.props.versionId, parentId: 'undefined' };
    const newSection = {
      versionId,
      parentId,
    };

    sectionService.delete(newSection)
    .then(result => {
      this.props.onAddSection(result);
    })
    .catch(error => console.log(error)); */
  }

  render() {
    const { sectionIndex, anidation, root, tree, selectedSectionId } = this.props;
    const { hover, collapsed } = this.state;
    const section = this.getSection();
    const { _id, title } = section || { _id: 'undefined', title: this.props.title };

    // Is this section the selected one?
    const selected = selectedSectionId === _id;
    // Subsections
    const subsections = tree[_id];

    const onSelectSection = () => this.props.onSelectSection(section, sectionIndex);

    // Change color on mouse hover
    const hoverStyle = hover || selected ? { color: Colors.MAIN } : { color: '#4A4A4A' };

    // Only render children if they exist
    const hasSubtree = subsections && subsections.length > 0 && !collapsed;

    return (
      <div style={styles.container}>

        {renderIf(root)(() => (
          <span style={styles.title}>
            {title}
            {renderIf(!this.props.static)(() => (
              <Icon name="plus" style={styles.icon} onClick={this.addSection} />
              ))
            }
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

            {renderIf(!this.props.static)(() => (
              <span>
                <Icon name="plus" style={styles.icon} onClick={this.addSection} />
                <Icon name="trash" style={styles.icon} onClick={this.deleteSection} />
              </span>
              ))
            }
          </span>
        ))}

        {renderIf(hasSubtree)(() => (
          <div style={styles.subtree}>
            {subsections.map((subsection, i) => (
              <Node
                key={i}
                static={this.props.static}
                selectedSectionId={selectedSectionId}
                onSelectSection={this.props.onSelectSection}
                onAddSection={this.props.onAddSection}
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

