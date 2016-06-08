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
      extraSpace: PropTypes.object,
      first: PropTypes.bool,
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
      editing: false,
      text: props.text,
    };
    this.onBlur = this.onBlur.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
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
    if (!canRespond) return;
    e.stopPropagation();
    onClickFunc(columnNumber, index);
  }

  onMouseEnter() {
    const { canRespond, columnNumber, index, onMouseEnter } = this.props;
    if (!canRespond) return;
    onMouseEnter(columnNumber, index);
  }

  onMouseLeave() {
    const { canRespond } = this.props;
    if (!canRespond) return;
    this.props.onMouseLeave();
  }

  onDeleteClick(e) {
    e.stopPropagation();
    const { canDelete, columnNumber, index, onDelete } = this.props;
    if (canDelete) onDelete(columnNumber, index);
  }

  changeElement(e) {
    e.stopPropagation();
    this.props.endElementLink();
    const canEdit = this.props.canEdit;
    if (canEdit) this.setState({ editing: !this.state.editing });
  }

  onBlur(e) {
    const { onEdit, columnNumber, index } = this.props;
    onEdit(columnNumber, index, this.state.text);
    this.changeElement(e);
  }

  onChange(e) {
    const text = e.target.value;
    if (text.length === 0) {
      this.onDeleteClick(e);
    }
    this.setState({ text });
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
            onKeyDown={(e) => { if (e.key === 'Enter') this.onBlur(e); }}
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
      extraSpace,
      first,
      last,
      globalDragging,
      cursorClick,
      canRespond,
    } = this.props;

    const rowStyle = {};
    if (extraSpace) {
      if (!last) {
        rowStyle.marginBottom = extraSpace.row;
        if (first) {
          rowStyle.marginTop = extraSpace.top;
        }
      } else {
        rowStyle.marginBottom = extraSpace.bottom;
      }
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
        cursorStyle = 'cursorGrab';
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
