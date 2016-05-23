import React, { Component } from 'react';
import { RichUtils, Entity, getVisibleSelectionRect } from 'draft-js';
import { Popover } from 'react-bootstrap';
import InlineInput from './inline-input';
import InlineControls from '../controls/inline-controls';
import getSelectedEntityType from '../utils/getSelectedEntityType';

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

    const toolbarHeight = toolbar ? toolbar.offsetHeight : 0;
    const offsetLeft = (rangeBounds.left - editorBounds.left) + (rangeBounds.width / 2);
    // const offsetBottom =  - rangeBounds.top + editorBounds.top + rangeBounds.height;
    // const offsetBottom = rangeBounds.top - editorBounds.top - (toolbarHeight + 14);
    //const offsetBottom = - rangeBounds.top;
    const offsetTop = rangeBounds.top - editorBounds.top - (toolbarHeight ? toolbarHeight + 10 : 60);
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

    if (selectionCoords && !position || position.bottom !== offsetTop || position.left !== offsetLeft) {
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
    const selection = nextProps.editorState.getSelection();
    if (!selection.isCollapsed()) {
      this.setBarPosition();
    } else if (this.state.show) {
      this.setState({
        show: false,
        editingLink: false,
      });
    }
  }

  render() {
    const { editingLink, show, position } = this.state;
    const displayInline = editingLink ? { display: 'none' } : null;
    const listStyle = {
      ...displayInline,
      ...styles.list,
    };

    const display = show ? null : { display: 'none' };
    const wrapperStyle = {
      ...styles.wrapper,
      ...display,
      ...position,
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
        >
        <Popover
          placement="top"
          style={styles.base}
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
        </Popover>
      </div>
      </div>
    );
  }
}

const styles = {
  wrapper: {
    position: 'absolute',
    height: 0,
  },
  list: {
    padding: 0,
    margin: 0,
    whiteSpace: 'nowrap',
  },
  base: {
    backgroundColor: 'white',
    left: '-50%',
    height: 50,
    position: 'relative',
    display: 'table-cell',
    verticalAlign: 'middle',

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
