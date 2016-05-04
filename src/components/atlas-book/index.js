import React, { Component } from 'react';
import update from 'react-addons-update';
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
      tree: null,
      sectionParentId: 'undefined', // First select root sections
      sectionIndex: 0, // Select the first root section
      versionId: '',
    };


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
    this.currentSection = this.currentSection.bind(this);
    this.replaceCurrentSection = this.replaceCurrentSection.bind(this);
  }

  componentDidMount() {
    this.fetchTree();
  }

  componentWillUnmount() {
    clearInterval(this.patchTimer);
  }

  onAddSection(section) {
    const tree = this.state.tree;
    const parentId = section.parentId;

    // If it is defined, push, if not, set.
    const action = tree[parentId] ? '$push' : '$set';
    this.setState({
      tree: update(tree, { [parentId]: { [action]: [section] } }),
    });
  }


  /**
   * Returns the currently selected section
   * @returns {Object} The selected section or an empty section
   */
  currentSection() {
    const { tree, sectionParentId, sectionIndex } = this.state;
    if (!tree) return { title: '', content: [] };

    return tree[sectionParentId][sectionIndex];
  }


  /**
   * Changes the 'pointers' to the currently selected section that is contained inside the tree
   *
   * @param sectionParentId
   * @param sectionIndex
   */
  onSelectSection(sectionParentId, sectionIndex) {
    this.tryPatchSection();
    this.setState({
      sectionParentId,
      sectionIndex,
    });
  }


  /**
   * Replaces de currently selected section which is inside the tree with an updated version
   *
   * @param section
   */
  replaceCurrentSection(section) {
    const { tree, sectionParentId, sectionIndex } = this.state;
    // Replace section in tree
    this.setState({
      tree: update(tree, {
        [sectionParentId]: {
          $splice: [[sectionIndex, 1, section]],
        },
      }),
    });
  }

  /**
   * Called every time the currently selected section's contents are changed
   *
   * @param content
   * @returns {undefined}
   */
  onChangeContent(content) {
    // Create a new object from current section and change content
    const section = { ...this.currentSection(), content };
    // Replace section in tree
    this.replaceCurrentSection(section);
    this.shouldPatchContent = true;
  }


  /**
   * Called every time the currently selected section's title is changed
   *
   * @param title
   */
  onChangeTitle(title) {
    // Create a new object from current section and change title
    const section = { ...this.currentSection(), title };
    // Replace section in tree
    this.replaceCurrentSection(section);
    this.shouldPatchTitle = true;
  }


  /**
   * Fetches a tree containing all the atlas' sections
   */
  fetchTree() {
    const query = {
      atlasId: this.props.params.atlas.id,
      version: 'latest',
      $limit: 100,
    };

    return versionService.find({ query })
      .then(results => {
        const version = results.data[0];
        // Get sections tree
        return treeService.get(version.id)
        .then(tree => {
          this.setState({
            tree,
            versionId: version.id,
          });

          // Patch section every 3 seconds.
          this.patchTimer = setInterval(() => this.tryPatchSection(), 3000);
        });
      });
  }


  /**
   * Tries to update the currently selected section on server
   */
  tryPatchSection() {
    const { _id, title, content } = this.currentSection();

    const patch = {};
    if (this.shouldPatchTitle) {
      patch.title = title;
    }
    if (this.shouldPatchContent) {
      patch.content = content;
    }

    // Nothing to patch
    if (patch.length === 0) return;

    sectionService.patch(_id, patch);
    this.shouldPatchTitle = false;
    this.shouldPatchContent = false;
  }


  render() {
    const section = this.currentSection();
    return (
      <div style={styles.container}>
        <AtlasTree
          tree={this.state.tree}
          title={this.props.params.atlas.title}
          versionId={this.state.versionId}
          onSelectSection={this.onSelectSection}
          onAddSection={this.onAddSection}
        />
        <AtlasSection
          section={section}
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
