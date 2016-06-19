import React, { PropTypes, Component } from 'react';
import { Collapse } from 'react-bootstrap';
import isEqual from 'lodash/isEqual';

import RichEditor from '../rich-editor';

const MIN_DELTA = 30;


export default class AtlasSection extends Component {

  static get propTypes() {
    return {
      readOnly: PropTypes.bool,
      section: PropTypes.object,
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
      collapsed: false,
    };
    this.onEditorScroll = this.onEditorScroll.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onTitleLostFocus = this.onTitleLostFocus.bind(this);
  }

  // Only update if contents or title have changed
  shouldComponentUpdate(nextProps, nextState) {
    const collapsedChanged = this.state.collapsed !== nextState.collapsed;
    const contentChanged = !isEqual(nextProps.section.content, this.props.section.content);
    const titleChanged = !isEqual(nextProps.section.title, this.props.section.title);

    return contentChanged || titleChanged || collapsedChanged;
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

  onEditorScroll(e) {
    const y = e.target.scrollTop;
    const { previousY } = this.state;
    const delta = y - previousY;
    if (delta > MIN_DELTA && !this.state.collapsed) {
      // Scrolling down
      this.setState({ collapsed: true });
    } else if (-delta > MIN_DELTA && this.state.collapsed) {
      // Scrolling up
      this.setState({ collapsed: false });
    } else {
      return;
    }
    this.setState({ previousY: y });
  }

  render() {
    const { section, readOnly } = this.props;
    return (
      <div style={styles.container}>
        <Collapse in={!this.state.collapsed}>
          <div>
            <input
              style={styles.title}
              onChange={this.onChangeTitle}
              onBlur={this.onTitleLostFocus}
              value={section.title}
              disabled={readOnly}
            />
          </div>
        </Collapse>

        <RichEditor
          content={section.content}
          onChange={this.onChangeContent}
          onScroll={this.onEditorScroll}
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
