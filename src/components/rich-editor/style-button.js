import React, { Component } from 'react';

export default class StyleButton extends Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let style;
    if (this.props.active) {
      style = { ...styles.styleButton, ...styles.activeButton };
    } else {
      style = styles.styleButton;
    }

    return (
      <span style={style} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const styles = {
  styleButton: {
    color: '#999',
    cursor: 'pointer',
    marginRight: 16,
    padding: '2px 0',
  },
  activeButton: {
    fontWeight: 'bold',
  },
  controls: {
    fontFamily: '"Helvetica", sans-serif',
    fontSize: 14,
    marginBottom: 5,
    userSelect: 'none',
  },
};
