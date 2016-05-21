import React, { Component } from 'react';
import { RichUtils, Entity } from 'draft-js';
import StyleButton from './style-button';

const INLINE_STYLES = [
  { icon: 'bold', style: 'BOLD' },
  { icon: 'italic', style: 'ITALIC' },
  { icon: 'underline', style: 'UNDERLINE' },
  //{ label: 'Monospace', style: 'CODE' },
];

export default class InlineControls extends Component {

  constructor(props) {
    super(props);
    this.onToggle = this.onToggle.bind(this);
    this.hasLink = this.hasLink.bind(this);
    this.toggleLink = this.toggleLink.bind(this);
  }

  onToggle(style) {
    this.props.onChange(
      RichUtils.toggleInlineStyle(this.props.editorState, style)
    );
  }

  toggleLink() {
    if (this.hasLink()) {
      this.unlink();
    } else {
      this.props.onEditingLink();
    }
  }

  hasLink() {
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    const anchorKey = selection.getAnchorKey();
    const contentState = editorState.getCurrentContent();
    const anchorBlock = contentState.getBlockForKey(anchorKey);
    const entityKey = anchorBlock.getEntityAt(selection.anchorOffset);
    if (entityKey) {
      const entity = Entity.get(entityKey);
      if (entity.getType() === 'link') {
        return true;
      }
    }
    return false;
  }

  unlink() {
    const { editorState } = this.props;
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.props.onChange(RichUtils.toggleLink(editorState, selection, null));
    }
  }

  render() {
    const currentStyle = this.props.editorState.getCurrentInlineStyle();
    return (
      <div>
        {INLINE_STYLES.map(type => {
          const { label, icon, style } = type;
          const active = currentStyle.has(style);
          return (
            <StyleButton
              key={style}
              active={active}
              label={label}
              icon={icon}
              onToggle={this.onToggle}
              style={style}
            />
          );
        })}

        {/* Inline entities */}

        <StyleButton
          key="link"
          active={this.hasLink}
          icon="link"
          onToggle={this.toggleLink}
        />
      </div>
    );
  }
}

