import React, { Component } from 'react';
import renderIf from 'render-if';
import Icon from 'react-fa';
import { Colors } from '../../../styles';

export default class StyleButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false,
    };

    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    const { label, icon, active } = this.props;
    const hover = this.state.hover;
    let style = styles.styleButton;
    if (active) {
      style = { ...style, ...styles.activeButton };
    }
    if (hover) {
      style = { ...style, ...styles.hoverButton };
    }

    return (
      <span
        style={style}
        onMouseDown={this.onToggle}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        {renderIf(icon)(() => (
          <Icon name={icon} />
        ))}
        {label}
      </span>
    );
  }
}

const styles = {
  styleButton: {
    color: '#999',
    cursor: 'pointer',
    marginRight: 8,
    marginLeft: 8,
    padding: '2px 0',
  },
  activeButton: {
    color: Colors.MAIN,
  },
  hoverButton: {
    color: Colors.MAIN,
  },
  controls: {
    fontFamily: '"Helvetica", sans-serif',
    fontSize: 16,
    marginBottom: 5,
    userSelect: 'none',
  },
};
