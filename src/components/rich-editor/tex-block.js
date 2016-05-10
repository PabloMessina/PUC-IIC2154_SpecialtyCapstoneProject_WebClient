/**
 * Copyright (c) 2013-present, Facebook, Inc. All rights reserved.
 *
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

import katex from 'katex';
import React from 'react';
import ReactDOM from 'react-dom';
import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { Entity } from 'draft-js';

class KatexOutput extends React.Component {
  constructor(props) {
    super(props);
    this._timer = null;
  }

  _update() {
    if (this._timer) {
      clearTimeout(this._timer);
    }

    this._timer = setTimeout(() => {
      katex.render(
        this.props.content,
        this.refs.container,
        {displayMode: true}
      );
    }, 0);
  }

  componentDidMount() {
    this._update();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content !== this.props.content) {
      this._update();
    }
  }

  componentWillUnmount() {
    clearTimeout(this._timer);
    this._timer = null;
  }

  render() {
    return <div ref="container" onClick={this.props.onClick} />;
  }
}

export default class TeXBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editMode: false};

    this._onClick = () => {
      if (this.state.editMode) {
        return;
      }

      this.setState({
        editMode: true,
        texValue: this._getValue(),
      });
    };

    this._onValueChange = evt => {
      var value = evt.target.value;
      var invalid = false;
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

    this._save = () => {
      var entityKey = this.props.block.getEntityAt(0);
      Entity.mergeData(entityKey, {content: this.state.texValue});
      this.editPanel.hide();
      this.setState({
        invalidTeX: false,
        editMode: false,
        texValue: '',
      });
    };

    this._remove = () => {
      this.props.blockProps.onRemove(this.props.block.getKey());
    };
  }

  _getValue() {
    return Entity
      .get(this.props.block.getEntityAt(0))
      .getData()['content'];
  }

  render() {
    var texContent = null;
    if (this.state.editMode) {
      if (this.state.invalidTeX) {
        texContent = '';
      } else {
        texContent = this.state.texValue;
      }
    } else {
      texContent = this._getValue();
    }

    var editPanel = null;
      editPanel =
        <Popover >
          <textarea
            style={styles.textarea}
            onChange={this._onValueChange}
            ref="textarea"
            value={this.state.texValue}
          />
          <div className="TeXEditor-buttons">
            <Button
              disabled={this.state.invalidTeX}
              bsSize="small"
              onClick={this._save}>
              {this.state.invalidTeX ? 'Invalid TeX' : 'Done'}
            </Button>
            <Button  
              bsSize="small"
              onClick={this._remove}>
              Remove
            </Button>
          </div>
        </Popover>;

    return (
      <div  >
        <OverlayTrigger
          ref={overlay => (this.editPanel = overlay)}
          trigger="click"
          placement="bottom"
          rootClose
          overlay={editPanel}
          onEntered={this._onClick}
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
