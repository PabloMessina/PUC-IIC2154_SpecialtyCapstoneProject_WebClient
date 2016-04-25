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

    // Subscribe to events.
    sectionService.on('patched', section => {
      this.setState({ section });
    });

    // Patch section every 3 seconds.
    this.patchTimer = setInterval(() => this.tryPatchSection(), 3000);

    // Wether it should send a request to the
    // server to patch the current section.
    this.shouldPatchSection = false;

    this.fetchTree = this.fetchTree.bind(this);
    this.tryPatchSection = this.tryPatchSection.bind(this);
    this.onSelectSection = this.onSelectSection.bind(this);
    this.onAddSection = this.onAddSection.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
  }

  componentDidMount() {
    this.fetchTree();
  }

  componentWillUnmount() {
    clearInterval(this.patchTimer);
  }

  onSelectSection(section) {
    this.tryPatchSection();
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
    this.shouldPatchSection = true;
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


  /**
   * Update section contents on server
   *
   * @param section
   * @returns {undefined}
   */
  tryPatchSection() {
    if (!this.shouldPatchSection) return;

    const section = this.state.section;
    const content = { content: section.content };
    sectionService.patch(section._id, content);
    this.shouldPatchSection = false;
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
