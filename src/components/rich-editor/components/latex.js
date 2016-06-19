/* eslint no-underscore-dangle:0 react/no-multi-comp:0 */

import React, { PropTypes, Component } from 'react';
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { Entity } from 'draft-js';
import katex from 'katex';

class KatexOutput extends Component {

  static propTypes = {
    content: PropTypes.object,
    readOnly: PropTypes.bool,
    onClick: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.timer = null;
  }

  componentDidMount() {
    this.update();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content !== this.props.content) {
      this.update();
    }
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.readOnly;
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  update() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      katex.render(
        this.props.content,
        this.refs.container,
        { displayMode: true }
      );
    }, 0);
  }

  render() {
    const { readOnly, onClick } = this.props;
    return <div style={styles.output} ref="container" onClick={readOnly ? null : onClick} />;
  }
}

export default class Latex extends Component {

  static propTypes = {
    block: PropTypes.any,
    blockProps: PropTypes.any,
  }

  constructor(props) {
    super(props);
    this.state = { editMode: false };

    this.onClick = () => {
      if (this.state.editMode) {
        return;
      }

      this.setState({
        editMode: true,
        texValue: this.getValue(),
      }, () => {
        this.startEdit();
      });
    };

    this.onValueChange = evt => {
      const value = evt.target.value;
      let invalid = false;
      try {
        katex.__parse(value);
      } catch (e) {
        invalid = true;
      } finally {
        this.setState({
          invalidTeX: invalid,
          texValue: value,
        }, this.save);
      }
    };

    this.save = () => {
      const entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, { content: this.state.texValue });
      this.props.blockProps.onChange();
    };

    this.remove = () => {
      this.finishEdit();
      this.props.blockProps.onRemove(this.props.block.getKey());
    };

    this.startEdit = () => {
      this.props.blockProps.onStartEdit();
    };

    this.finishEdit = () => {
      this.setState({
        invalidTeX: false,
        editMode: false,
        texValue: '',
      });
      this.props.blockProps.onFinishEdit();
    };
  }

  getValue() {
    return Entity
      .get(this.props.block.getEntityAt(0))
      .getData().content;
  }

  render() {
    const { readOnly } = this.props.blockProps;
    let texContent = null;
    if (this.state.editMode) {
      if (this.state.invalidTeX) {
        texContent = '';
      } else {
        texContent = this.state.texValue;
      }
    } else {
      texContent = this.getValue();
    }

    const editPanel = (
      <Popover id="latex-popover">
        <textarea
          style={styles.textarea}
          onChange={this.onValueChange}
          ref="textarea"
          value={this.state.texValue}
        />
        <div>
          <Button
            bsSize="small"
            onClick={this.remove}
          >
            Remove
          </Button>
        </div>
      </Popover>
    );

    return (
      <div>
        <OverlayTrigger
          ref={overlay => (this.editPanel = overlay)}
          container={document.body}
          trigger="click"
          placement="bottom"
          rootClose
          overlay={editPanel}
          onEntered={this.onClick}
          onExited={this.finishEdit}
        >

          <KatexOutput ref="target" readOnly={readOnly} content={texContent} />
        </OverlayTrigger>
      </div>
    );
  }
}

const styles = {
  textarea: {
    border: 'none',
    outline: 'none',
  },
  output: {
    cursor: 'pointer',
  },
};
