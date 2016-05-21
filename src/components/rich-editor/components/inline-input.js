/*
 *  * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *  *
 *  * License: MIT
 *  */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { EditorState, RichUtils, Entity } from 'draft-js';

export default class InlineInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      link: '',
    };

    this.onLinkChange = this.onLinkChange.bind(this);
    this.onLinkKeyDown = this.onLinkKeyDown.bind(this);
  }

  setLink() {
    let { link } = this.state;
    const { editorState } = this.props;
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = `http://${link}`;
    }
    const entityKey = Entity.create('link', 'MUTABLE', { url: link });
    let newState = RichUtils.toggleLink(
      editorState,
      editorState.getSelection(),
      entityKey
    );
    newState = EditorState.forceSelection(
      newState, editorState.getSelection());
      this.props.onChange(newState);
  }

  onLinkChange(event) {
    this.setState({ link: event.target.value });
  }

  onLinkKeyDown(event) {
    const { editor } = this.props;
    if (event.key === 'Enter') {
      event.preventDefault();
      this.setLink();
      this.props.cancelLink();
      this.setState({
        show: false,
        link: '',
      });
      editor.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      ReactDOM.findDOMNode(editor.focus());
      this.props.cancelLink();
      this.setState({
        link: '',
      });

      const { editorState } = this.props;
      this.props.onChange(
        EditorState.forceSelection(
          editorState, editorState.getSelection()));
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.editingLink && !prevProps.editingLink) {
      this.refs.textInput.focus();
    }
  }

  render() {
    const display = !this.props.editingLink ? { display: 'none' } : null;
    const style = {
      ...styles.base,
      ...display,
    };

    return (
      <input
        ref="textInput"
        style={style}
        type="text"
        onChange={this.onLinkChange}
        value={this.state.link}
        onKeyDown={this.onLinkKeyDown}
        placeholder="Type the link and press enter"
      />
    );
  }
}

const styles = {
  base: {

  },
};
