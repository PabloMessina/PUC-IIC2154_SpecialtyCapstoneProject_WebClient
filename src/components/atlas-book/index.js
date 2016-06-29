/* eslint no-underscore-dangle:0 no-alert:0 */

import React, { PropTypes, Component } from 'react';
import update from 'react-addons-update';
import DocumentTitle from 'react-document-title';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';

import AtlasSection from '../atlas-section';
import AtlasTree from '../atlas-tree';

import app, { currentUser } from '../../app';
const sectionService = app.service('/sections');
const versionService = app.service('/versions');
const treeService = app.service('/section-tree');


export default class AtlasBook extends Component {

  static propTypes = {
    readOnly: PropTypes.bool,
    interval: PropTypes.number,
    maxWait: PropTypes.number,
    // React Router
    router: PropTypes.object,
    params: PropTypes.object,
  }

  static defaultProps = {
    readOnly: false,
    interval: 3000, // 3 seconds
    maxWait: 10000, // 10 seconds
  }

  constructor(props) {
    super(props);
    this.state = {
      tree: null,
      saving: false,
      sectionParentId: 'undefined', // First select root sections
      sectionIndex: 0, // Select the first root section
      version: {},
      lastTitle: '',
      lastContent: '',
    };
    this.debouncedPatchSection = debounce(this.patchSection, props.interval, { maxWait: props.maxWait });
  }

  componentDidMount() {
    this.fetchTree(this.props.params.atlas);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params && nextProps.params.atlas) {
      this.fetchTree(nextProps.params.atlas);
    }
    if (nextProps.interval !== this.props.interval) {
      // TODO: update when maxWait changes
      this.debouncedPatchSection = debounce(this.patchSection, nextProps.interval, { maxWait: nextProps.maxWait });
    }
  }

  onAddSection = (parentId) => {
    const { tree, version } = this.state;

    const newSection = { versionId: version.id };
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

  onRemoveSection = (section, sectionIndex) => {
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
  onSelectSection = (sectionParentId, sectionIndex) => {
    // Save current content
    this.debouncedPatchSection.flush();

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
  onChangeContent = (content) => {
    if (!this.state.tree) return;
    if (isEmpty(content) || isEqual(this.state.lastContent, content)) return;

    // Create a new object from current section and change content
    const section = { ...this.currentSection(), content };
    // Replace section in tree
    this.replaceCurrentSection(section);
  }

  /**
   * Called every time the currently selected section's title is changed
   *
   * @param title
   */
  onChangeTitle = (title) => {
    if (this.state.lastTitle === title) return;

    // Create a new object from current section and change title
    const section = { ...this.currentSection(), title };
    // Replace section in tree
    this.replaceCurrentSection(section);
  }

  /**
  * Returns the currently selected section
  * @returns {Object} The selected section or an empty section
  */
  currentSection = () => {
    const { tree, sectionParentId, sectionIndex } = this.state;
    if (!tree) return { title: '', content: null };

    return tree[sectionParentId][sectionIndex];
  }

  /**
   * Replaces de currently selected section which is inside the tree with an updated version
   *
   * @param section
   */
  replaceCurrentSection = (section) => {
    const { tree, sectionParentId, sectionIndex } = this.state;

    // Replace section in tree
    return this.setState({
      saving: true,
      tree: update(tree, {
        [sectionParentId]: {
          $splice: [[sectionIndex, 1, section]],
        },
      }),
    }, this.debouncedPatchSection); // save after render
  }

  /**
   * Fetches a tree containing all the atlas' sections
   */
  fetchTree = async (atlas) => {
    const query = {
      atlasId: atlas.id || atlas,
      version: 'latest',
      $limit: 1,
    };

    const results = await versionService.find({ query });
    const version = results.data[0];

    const tree = await treeService.get(version.id);
    return this.setState({ tree, version });
  }


  /**
   * Tries to update the currently selected section on server
   */
  patchSection = () => {
    const { _id, title, content } = this.currentSection();

    const patch = {
      title,
      content,
    };

    return sectionService.patch(_id, patch).then(result => {
      console.log('Saved at', result.updatedAt); // eslint-disable-line
      this.setState({
        saving: false,
        lastTitle: result.title,
        lastContent: result.content,
      });
    }).catch(error => this.setState({ error }));
  }

  render() {
    const atlas = this.props.params.atlas;
    const { tree, error, saving } = this.state;
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
          selectedSectionId={section._id}
          onSelectSection={this.onSelectSection}
          onAddSection={this.onAddSection}
          onRemoveSection={this.onRemoveSection}
          readOnly={readOnly}
        />
        <AtlasSection
          saving={saving}
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
