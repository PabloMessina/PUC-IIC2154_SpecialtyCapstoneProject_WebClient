/* eslint react/sort-comp:0 */

import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import { Row, Panel } from 'react-bootstrap';

/**
 * First, every element is rendered without any extra space in between.
 * After it has been rendered, we can get its height and pass it to the parent,
 * so it can compute the spacing needed to have both columns of the same height.
 */
export default class Element extends Component {
  static get propTypes() {
    return {
      index: PropTypes.number.isRequired,
      text: PropTypes.string,
      columnNumber: PropTypes.number.isRequired,
      onHeightComputed: PropTypes.func,
      extraRowSpace: PropTypes.number,
      last: PropTypes.bool,
      globalDragging: PropTypes.bool,
      cursorClick: PropTypes.bool,
      canEdit: PropTypes.bool,
      canDelete: PropTypes.bool,
      canRespond: PropTypes.bool,
      onClickFunc: PropTypes.func,
      onMouseEnter: PropTypes.func,
      onMouseLeave: PropTypes.func,
      onEdit: PropTypes.func,
      onDelete: PropTypes.func,
      endElementLink: PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      canEdit: true,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
      editing: !props.text,
    };
    this.onBlur = this.onBlur.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.changeElement = this.changeElement.bind(this);
    this.renderElement = this.renderElement.bind(this);
  }

  componentDidMount() {
    const { onHeightComputed } = this.props;
    this.domNode = ReactDOM.findDOMNode(this);
    const height = this.domNode.firstChild.offsetHeight;
    onHeightComputed(height);
  }

  onClick(e) {
    const { canRespond, columnNumber, index, onClickFunc } = this.props;
    const { editing } = this.state;
    if (!canRespond) return;
    e.stopPropagation();
    if (!editing) onClickFunc(columnNumber, index);
  }

  onMouseEnter() {
    const { canRespond, columnNumber, index, onMouseEnter } = this.props;
    if (!canRespond) return;
    onMouseEnter(columnNumber, index);
  }

  onMouseLeave() {
    const { canRespond, onMouseLeave } = this.props;
    if (!canRespond) return;
    onMouseLeave();
  }

  onDelete() {
    const { canDelete, columnNumber, index, onDelete } = this.props;
    if (canDelete) {
      onDelete(columnNumber, index);
    } else {
      this.setState({
        editing: false,
        text: this.props.text,
      });
      onDelete(null);
    }
  }

  changeElement() {
    this.props.endElementLink();
    this.setState({ editing: !this.state.editing });
  }

  onBlur() {
    const { onEdit, columnNumber, index } = this.props;
    const { text } = this.state;
    if (text) {
      onEdit(columnNumber, index, text);
      this.changeElement();
    } else {
      this.onDelete();
    }
  }

  onChange(e) {
    const text = e.target.value;
    this.setState({ text });
  }

  onKeyDown(e) {
    if (e.key === 'Enter') {
      this.onBlur();
    }
  }

  renderElement() {
    const { text, editing } = this.state;
    const { canEdit } = this.props;
    if (canEdit && editing || text === undefined) {
      return (
        <div>
          <input
            style={styles.text}
            value={text}
            onBlur={this.onBlur}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            autoFocus
          />
        </div>
      );
    }
    return (
      <p style={styles.text}>
        {text}
      </p>
    );
  }

  render() {
    const {
      text,
      extraRowSpace,
      last,
      globalDragging,
      cursorClick,
      canRespond,
    } = this.props;

    const rowStyle = {};
    if (extraRowSpace && !last) {
      rowStyle.marginBottom = extraRowSpace;
    }

    const hoverStyle = canRespond ? 'correlationElementHover' : '';

    let cursorStyle;
    if (canRespond) {
      if (globalDragging) {
        if (cursorClick) {
          cursorStyle = 'cursorClick';
        } else {
          cursorStyle = '';
        }
      } else {
        cursorStyle = 'cursorClick';
      }
    } else {
      cursorStyle = '';
    }

    return (
      <Row style={rowStyle}>
        <Panel
          className={`correlationElement ${hoverStyle} ${cursorStyle}`/* CSS styles in app.less */}
          onDoubleClick={this.changeElement}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onClick={this.onClick}
        >
          {this.renderElement(text)}
        </Panel>
      </Row>
    );
  }
}

const styles = {
  text: {
    margin: 0,
  },
};
