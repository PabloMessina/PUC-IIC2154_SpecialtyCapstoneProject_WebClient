import React, { Component } from 'react';
import AtlasSection from '../atlas-section';
import AtlasTree from '../atlas-tree';
import app from '../../app';

const sectionService = app.service('/sections');
const versionService = app.service('/versions');
const treeService = app.service('/section-tree');

export default class AtlasBook extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
      atlasId: React.PropTypes.string,
    };
  }

  static get defaultProps() {
    return {
      static: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      tree: {},
      section: { content: [] },
    };

    this.fetchTree = this.fetchTree.bind(this);
    this.onSelectSection = this.onSelectSection.bind(this);
    this.onAddSection = this.onAddSection.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
  }

  componentDidMount() {
    this.fetchTree();
  }

  onSelectSection(section) {
    // sectionService.update(this.state.section)
    this.setState({
      section,
    });
  }

  onChangeContent(value) {
    const section = this.state.section;
    if (!section) {
      return;
    }
    section.content = value;
    this.setState({
      section,
    });
  }

  onAddSection(section) {
    const tree = this.state.tree;
    const parentId = section.parentId;

    tree[parentId] = tree[parentId] || [];
    tree[parentId].push(section);
    this.setState({
      tree,
    });
  }


  fetchTree() {
    const query = {
      atlasId: this.props.params.atlasId,
      version: 'latest',
    };

    return versionService.find({ query })
      .then(results => {
        // Get section's tree
        return treeService.get(results.data[0].id)
        .then(tree => {
          this.setState({
            tree,
            section: tree.undefined[0], // Select first section on start
          });
        });
      });
  }


  render() {
    const content = this.state.section.content;
    return (
      <div style={styles.container}>
        <AtlasTree
          tree={this.state.tree}
          onSelectSection={this.onSelectSection}
          onAddSection={this.onAddSection}
        />
        <AtlasSection
          content={content}
          onChangeContent={this.onChangeContent}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'nowrap',
    flexDirection: 'row',
  },
};
