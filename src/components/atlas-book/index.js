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
      section: { title: '', content: [] },
    };

    // Subscribe to events.
    /*sectionService.on('patched', section => {
      if (this.state.section._id === section._id) {
        this.setState({ section });
      }
      });*/

    // Patch section every 3 seconds.
    this.patchTimer = setInterval(() => this.tryPatchSection(), 3000);

    // Wether it should send a request to the
    // server to patch the current section.
    this.shouldPatchContent = false;
    this.shouldPatchTitle = false;

    this.fetchTree = this.fetchTree.bind(this);
    this.tryPatchSection = this.tryPatchSection.bind(this);
    this.onSelectSection = this.onSelectSection.bind(this);
    this.onAddSection = this.onAddSection.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
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
    section.content = value;
    this.setState({
      section,
    });
    this.shouldPatchContent = true;
  }

  onChangeTitle(title) {
    const section = this.state.section;
    this.setState({
      section: { ...section, title },
    });
    console.log(this.state.section.title);
    console.log(title);
    this.shouldPatchTitle = true;
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
      atlasId: this.props.params.atlas.id,
      version: 'latest',
      $limit: 100,
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
    const { _id, title, content } = this.state.section;

    const newSection = {};
    if (this.shouldPatchTitle) {
      newSection.title = title;
    }
    if (this.shouldPatchContent) {
      newSection.content = content;
    }

    // Nothing to patch
    if (newSection.length === 0) return;

    sectionService.patch(_id, newSection);
    this.shouldPatchTitle = false;
    this.shouldPatchContent = false;
  }


  render() {
    return (
      <div style={styles.container}>
        <AtlasTree
          tree={this.state.tree}
          title={this.props.params.atlas.title}
          onSelectSection={this.onSelectSection}
          onAddSection={this.onAddSection}
        />
        <AtlasSection
          section={this.state.section}
          onChangeContent={this.onChangeContent}
          onChangeTitle={this.onChangeTitle}
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
