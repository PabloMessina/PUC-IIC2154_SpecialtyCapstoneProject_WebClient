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
      content: [],
    };

    this.fetchTree = this.fetchTree.bind(this);
    this.onSelectSection = this.onSelectSection.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
  }

  componentDidMount() {
    this.fetchTree();
  }

  onSelectSection(section) {
    this.setState({
      content: section.content,
    });
  }

  onTextChange(value) {
    if (!this.props.static) {
      this.setState({ text: value });
    }
    console.log(value);
  }

  fetchTree() {
    const query = {
      atlasId: this.props.params.atlasId,
      version: 'latest',
    };

    return versionService.find({ query })
      .then(results => {
        console.log(results.data[0].id)
        const query2 = {
          versionId: results.data[0].id,
          $sort: { createdAt: 1 },
        };
        // Get section's tree
        return treeService.get(results.data[0].id)
        .then(tree => {
          console.log(tree)
          this.setState({
            tree,
            content: tree.undefined[0].content, // Select first section on start
          });
        });

      });
  }


  render() {
    return (
      <div style={styles.container}>
        <AtlasTree
          static
          tree={this.state.tree}
          onSelectSection={this.onSelectSection}
        />
        <AtlasSection content={this.state.content} />
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
