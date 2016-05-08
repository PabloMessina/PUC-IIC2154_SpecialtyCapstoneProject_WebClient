import React, { Component } from 'react';
import { RichUtils } from 'draft-js';
import StyleButton from './style-button';

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
];

export default class InlineControls extends Component {

  constructor(props) {
    super(props);
    this.onToggle = this.onToggle.bind(this);
  }

  onToggle(style) {
    this.props.onChange(
      RichUtils.toggleInlineStyle(this.props.editorState, style)
    );
  }

  render() {
    const currentStyle = this.props.editorState.getCurrentInlineStyle();
    return (
      <div style={styles.controls}>
        {INLINE_STYLES.map(type =>
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={this.onToggle}
            style={type.style}
          />
        )}
      </div>
    );
  }
}

const styles = {
  controls: {

  },
};
