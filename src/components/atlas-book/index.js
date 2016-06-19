/* eslint no-underscore-dangle:0 no-alert:0 */

import React, { PropTypes, Component } from 'react';
import update from 'react-addons-update';
import isEmpty from 'lodash/isEmpty';
import DocumentTitle from 'react-document-title';

import AtlasSection from '../atlas-section';
import AtlasTree from '../atlas-tree';

import app, { currentUser } from '../../app';
const sectionService = app.service('/sections');
const versionService = app.service('/versions');
const treeService = app.service('/section-tree');


export default class AtlasBook extends Component {

  static get propTypes() {
    return {
      readOnly: PropTypes.bool,
      // React Router
      router: PropTypes.object,
      params: PropTypes.object,
    };
  }
  static get defaultProps() {
    return {
      readOnly: false,
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
    this.onRemoveSection = this.onRemoveSection.bind(this);
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

  onAddSection(parentId) {
    const { tree, versionId } = this.state;

    const newSection = { versionId };
    if (parentId) newSection.parentId = parentId;

    // Create section in server and set state on success
    return sectionService.create(newSection)
      .then(result => {
        // If it is defined, push, if not, set.
        const action = tree[parentId] ? '$push' : '$set';
        this.setState({
          tree: update(tree, { [parentId]: { [action]: [result] } }),
          error: null,
        });
        return result;
      })
      .catch(error => this.setState({ error }));
  }

  onRemoveSection(section, sectionIndex) {
    // TODO: check if has children
    const hasChildren = true;
    if (hasChildren && !window.confirm('This will remove all sub-sections. ¿Are you sure?')) {
      // User did cancel
      return false;
    }

    const tree = this.state.tree;
    const { _id, parentId } = section;
    const currentSection = this.currentSection();

    // All nodes that have the same parent
    const siblings = tree[parentId];

    // Can't delete last root section
    // TODO: Create server validations
    if (!parentId && siblings.length <= 1) return false;

    // Remove from server and set state on success
    return sectionService.remove(_id)
      .then(result => {
        const newState = { error: null };

        // Check if deleted section is selected and is last child
        if (siblings[sectionIndex]._id === currentSection._id && sectionIndex === siblings.length - 1) {
          if (sectionIndex === 0) {
            // There are no children left, select parent
            newState.sectionParentId = 'undefined';
          } else {
            // Go to next sibling
            newState.sectionIndex = sectionIndex - 1;
          }
        }
        // Update state
        newState.tree = update(tree, { [parentId]: { $splice: [[sectionIndex, 1]] } });
        this.setState(newState);
        return result;
      })
      .catch(error => this.setState({ error }));
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
   * Called every time the currently selected section's contents are changed
   *
   * @param content
   * @returns {undefined}
   */
  onChangeContent(content) {
    if (!this.state.tree) return;
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
  * Returns the currently selected section
  * @returns {Object} The selected section or an empty section
  */
  currentSection() {
    const { tree, sectionParentId, sectionIndex } = this.state;
    if (!tree) return { title: '', content: null };

    return tree[sectionParentId][sectionIndex];
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
    if (isEmpty(patch)) return;

    sectionService.patch(_id, patch);
    this.shouldPatchTitle = false;
    this.shouldPatchContent = false;
  }


  render() {
    const atlas = this.props.params.atlas;
    const { tree, versionId, error } = this.state;
    const readOnly = currentUser().id !== atlas.responsableId;

    if (error) {
      console.log(error); // eslint-disable-line
    }

    const section = this.currentSection();
    return (
      <div style={styles.container}>
        <DocumentTitle title={atlas.title} />
        <AtlasTree
          tree={tree}
          title={atlas.title}
          versionId={versionId}
          selectedSectionId={section._id}
          onSelectSection={this.onSelectSection}
          onAddSection={this.onAddSection}
          onRemoveSection={this.onRemoveSection}
          readOnly={readOnly}
        />
        <AtlasSection
          section={section}
          readOnly={readOnly}
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
