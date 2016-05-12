/* eslint no-underscore-dangle:0 no-multi-comp:0 */
import katex from 'katex';
import React from 'react';
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { Entity } from 'draft-js';

class KatexOutput extends React.Component {
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
    return <div ref="container" onClick={this.props.onClick} />;
  }
}

export default class TeXBlock extends React.Component {
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
        });
      }
    };

    this.save = () => {
      const entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, { content: this.state.texValue });
      this.editPanel.hide();
      this.setState({
        invalidTeX: false,
        editMode: false,
        texValue: '',
      });
    };

    this.remove = () => {
      this.props.blockProps.onRemove(this.props.block.getKey());
    };
  }

  getValue() {
    return Entity
      .get(this.props.block.getEntityAt(0))
      .getData().content;
  }

  render() {
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
      <Popover>
        <textarea
          style={styles.textarea}
          onChange={this.onValueChange}
          ref="textarea"
          value={this.state.texValue}
        />
        <div className="TeXEditor-buttons">
          <Button
            disabled={this.state.invalidTeX}
            bsSize="small"
            onClick={this.save}
          >
            {this.state.invalidTeX ? 'Invalid TeX' : 'Done'}
          </Button>
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
          trigger="click"
          placement="bottom"
          rootClose
          overlay={editPanel}
          onEntered={this.onClick}
        >

          <KatexOutput ref="target" content={texContent} />
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
};
