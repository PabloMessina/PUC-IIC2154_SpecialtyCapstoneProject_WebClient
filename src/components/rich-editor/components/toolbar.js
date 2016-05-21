import React, { Component } from "react";
import { RichUtils, Entity, getVisibleSelectionRect } from "draft-js";
import InlineInput from './inline-input';
import InlineControls from '../controls/inline-controls';

//import LinkInput from "./components/LinkInput";

export default class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      editingLink: false,
    };
    this.setBarPosition = this.setBarPosition.bind(this);
  }


  getSelectionCoords(editor, toolbar) {
    const editorBounds = editor.getBoundingClientRect();
    const rangeBounds = getVisibleSelectionRect(window);

    if (!rangeBounds) {
      return null;
    }

    const rangeWidth = rangeBounds.right - rangeBounds.left;

    const toolbarHeight = toolbar.offsetHeight;
    const offsetLeft = (rangeBounds.left - editorBounds.left)
    + (rangeWidth / 2);
    const offsetTop = rangeBounds.top - editorBounds.top - (toolbarHeight + 14);
    return { offsetLeft, offsetTop };
  }

  setBarPosition() {
    const editor = this.props.editor;
    const position = this.state.position;
    const toolbar = this.toolbar;
    const selectionCoords = this.getSelectionCoords(editor, toolbar);

    if (!selectionCoords) {
      return;
    }

    const { offsetTop, offsetLeft } = selectionCoords;
    console.log(offsetTop);

    if (selectionCoords && !position || position.top !== offsetTop || position.left !== offsetLeft) {
      this.setState({
        show: true,
        position: {
          top: offsetTop,
          left: offsetLeft,
        },
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.editorState.getSelection().isCollapsed()) {
      this.setBarPosition();
      return;
    }
    if (this.state.show) {
      this.setState({
        show: false,
        editingLink: false,
      });
    }

  }

  render() {
    const displayInline = this.state.editingLink ? { display: 'none' } : null;
    const listStyle = {
      ...displayInline,
      ...styles.list,
    };

    const display = !this.state.show ? { display: 'none' } : null;
    const wrapperStyle = {
      ...styles.wrapper,
      ...display,
      ...this.state.position,
    };

    const { editorState } = this.props;

    return (
      <div
        ref="toolbarWrapper"
        style={wrapperStyle}
        show={this.state.show}
      >
        <div
          ref={(toolbar) => this.toolbar = toolbar}
          style={styles.base}
          placement="top"
        >
          <ul style={listStyle} onMouseDown={(x) => { x.preventDefault(); }}>
            <InlineControls
              editorState={editorState}
              onChange={this.props.onChange}
              onEditingLink={() => this.setState({ editingLink: true })}
            />
          </ul>
          <InlineInput
            ref="textInput"
            editorState={this.props.editorState}
            onChange={this.props.onChange}
            editingLink={this.state.editingLink}
            editor={this.props.editor}
            cancelLink={() => this.setState({ editingLink: false })}
          />
          <span style={styles.arrow}/>
        </div>
      </div>
    );
  }
}

const styles = {
  wrapper: {
    background: 'yellow',
    height: 0,
    position: 'absolute',
  },
  list: {
    padding: '0 8px',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  base: {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
    left: '-50%',
    position: 'relative',
  },
  arrow: {
    display: 'inline-block',
    top: '100%',
    left: '50%',
    height: 0,
    width: 0,
    position: 'absolute',
    pointerEvents: 'none',
    borderWidth: '8px',
    borderStyle: 'solid',
    borderColor: '#FFFFFF transparent',
    borderColor: 'white transparent transparent',
    marginLeft: '-8px',
  },
};
