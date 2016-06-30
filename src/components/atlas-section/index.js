import React, { PropTypes, Component } from 'react';
import isEqual from 'lodash/isEqual';

import RichEditor from '../rich-editor';

export default class AtlasSection extends Component {

  static get propTypes() {
    return {
      readOnly: PropTypes.bool,
      section: PropTypes.object,
      saving: PropTypes.bool,
      onChangeTitle: PropTypes.func,
      onChangeContent: PropTypes.func,
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
      previousY: 0,
    };
    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onTitleLostFocus = this.onTitleLostFocus.bind(this);
  }

  // Only update if contents or title have changed
  shouldComponentUpdate(nextProps) {
    const { content, title } = this.props.section;
    const contentChanged = !isEqual(nextProps.section.content, content);
    const titleChanged = !isEqual(nextProps.section.title, title);
    const savingChanged = nextProps.saving !== this.props.saving;

    return contentChanged || titleChanged || savingChanged;
  }

  onChangeContent(rawContent) {
    this.props.onChangeContent(rawContent);
  }

  onChangeTitle(event) {
    const title = event.target.value;

    if (title !== this.props.section.title) {
      this.props.onChangeTitle(title);
    }
  }

  onTitleLostFocus() {
    if (this.props.section.title === '') {
      this.props.onChangeTitle('Untitled');
    }
  }

  render() {
    const { section, readOnly, saving } = this.props;

    return (
      <div style={styles.container}>
        <input
          style={styles.title}
          onChange={this.onChangeTitle}
          onBlur={this.onTitleLostFocus}
          value={section.title}
          disabled={readOnly}
        />

        <RichEditor
          content={section.content}
          saving={saving}
          onChange={this.onChangeContent}
          readOnly={readOnly}
          style={styles.editor}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    position: 'absolute',
    width: '80%',
    right: 0,
    bottom: 170,
    top: 64,
  },
  title: {
    outline: 'none',
    border: 'none',
    paddingTop: 5,
    paddingLeft: 16,
    fontWeight: 'bold',
    fontSize: 24,
    width: '100%',
  },
  editor: {
    fontSize: 20,
    overflow: 'auto',
    position: 'absolute',
    width: '100%',
    height: '100%',
    right: 0,
    bottom: -120,
  },
};
