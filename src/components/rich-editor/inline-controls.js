import React, { Component } from 'react';
import { RichUtils } from 'draft-js';
import StyleButton from './style-button';

const INLINE_STYLES = [
  { icon: 'bold', style: 'BOLD' },
  { icon: 'italic', style: 'ITALIC' },
  { icon: 'underline', style: 'UNDERLINE' },
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
      </div>
    );
  }
}

