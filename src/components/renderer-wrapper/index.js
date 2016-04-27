import React, { Component } from 'react';
import Renderer3D from '../renderer-3d/';

const LABEL_DRAG_TIME = 90; // milliseconds

export default class RendererWrapper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      edit: true,
      annotations: [
        {
          text: 'Aurícula derecha',
          pointPositions: [[232, 123, 542]],
          labelPosition: [1, 2, 3],
          selected: true,
        },
        {
          text: 'Aurícula izquierda',
          pointPositions: [[232, 123, 542], [123, 432, 132]],
          labelPosition: [1, 2, 3],
          selected: false,
          show: false,
        },
      ],
      localFiles: null,
      remoteFiles: null,
    };

    this._state = {
      draggingLabel: false,
    };

    this.handleFilesChanged = this.handleFilesChanged.bind(this);
    this.moveLabelUp = this.moveLabelUp.bind(this);
    this.moveLabelDown = this.moveLabelDown.bind(this);
    this.moveLabelLeft = this.moveLabelLeft.bind(this);
    this.moveLabelRight = this.moveLabelRight.bind(this);
    this.moveLabelNear = this.moveLabelNear.bind(this);
    this.moveLabelFar = this.moveLabelFar.bind(this);
    this.stopLabelPositionUpdates = this.stopLabelPositionUpdates.bind(this);
    this.updateLabelText = this.updateLabelText.bind(this);
    this.handleSelectedLabelChanged = this.handleSelectedLabelChanged.bind(this);
    this.refocusOnModel = this.refocusOnModel.bind(this);
  }

  handleFilesChanged() {
    const files = this.refs.filesInput.files;
    this.refs.r3d.loadModel(files, this.state.annotations);
    this.setState({ localFiles: files });
  }

  // ====================================
  // functions to manage label movements
  moveLabelUp(firstCall) {
    if (firstCall) this.draggingLabel = true;
    else if (!this.draggingLabel) return;
    this.refs.r3d.moveLabelUp();
    setTimeout(() => {
      this.moveLabelUp(false);
    }, LABEL_DRAG_TIME);
  }
  moveLabelDown(firstCall) {
    if (firstCall) this.draggingLabel = true;
    else if (!this.draggingLabel) return;
    this.refs.r3d.moveLabelDown();
    setTimeout(() => {
      this.moveLabelDown();
    }, LABEL_DRAG_TIME);
  }
  moveLabelRight(firstCall) {
    if (firstCall) this.draggingLabel = true;
    else if (!this.draggingLabel) return;
    this.refs.r3d.moveLabelRight();
    setTimeout(() => {
      this.moveLabelRight();
    }, LABEL_DRAG_TIME);
  }
  moveLabelLeft(firstCall) {
    if (firstCall) this.draggingLabel = true;
    else if (!this.draggingLabel) return;
    this.refs.r3d.moveLabelLeft();
    setTimeout(() => {
      this.moveLabelLeft();
    }, LABEL_DRAG_TIME);
  }
  moveLabelNear(firstCall) {
    if (firstCall) this.draggingLabel = true;
    else if (!this.draggingLabel) return;
    this.refs.r3d.moveLabelNear();
    setTimeout(() => {
      this.moveLabelNear();
    }, LABEL_DRAG_TIME);
  }
  moveLabelFar(firstCall) {
    if (firstCall) this.draggingLabel = true;
    else if (!this.draggingLabel) return;
    this.refs.r3d.moveLabelFar();
    setTimeout(() => {
      this.moveLabelFar();
    }, LABEL_DRAG_TIME);
  }
  stopLabelPositionUpdates() {
    this.draggingLabel = false;
  }

  /**
   * [updateLabelText : updates the label's text]
   */
  updateLabelText() {
    const text = this.refs.labelTextInput.value;
    this.refs.r3d.updateLabelText(text);
  }

  /**
   * [refocusOnModel : refocus the camera on the model]
   */
  refocusOnModel() {
    this.refs.r3d.refocusOnModel();
  }

  /**
   * [handleSelectedLabelChanged : callback that gets called every time
   * the currently selected label changes, so that we have a chance to use
   * the updated data to refresh visual controls]
   * @param  {[Object]} labelObj [an object with the label's data]
   */
  handleSelectedLabelChanged(labelObj) {
    if (labelObj) {
      // update text input
      this.refs.labelTextInput.value = labelObj.text || '<EMPTY>';
    } else { // default values
      // update text input
      this.refs.labelTextInput.value = '';
    }
  }

  render() {
    return (
      <div>
        <input ref="filesInput" type="file" onChange={this.handleFilesChanged} multiple></input>
        <input ref="labelTextInput" type="text" onChange={this.updateLabelText}></input>
        <button onMouseUp={this.stopLabelPositionUpdates}
          onMouseDown={() => this.moveLabelUp(true)}
        >^</button>
        <button onMouseUp={this.stopLabelPositionUpdates}
          onMouseDown={() => this.moveLabelDown(true)}
        >v</button>
        <button onMouseUp={this.stopLabelPositionUpdates}
          onMouseDown={() => this.moveLabelLeft(true)}
        >{'<'}</button>
        <button onMouseUp={this.stopLabelPositionUpdates}
          onMouseDown={() => this.moveLabelRight(true)}
        >{'>'}</button>
        <button onMouseUp={this.stopLabelPositionUpdates}
          onMouseDown={() => this.moveLabelFar(true)}
        >far</button>
        <button onMouseUp={this.stopLabelPositionUpdates}
          onMouseDown={() => this.moveLabelNear(true)}
        >near</button>
        <button onClick={this.refocusOnModel}>REFOCUS</button>
        <Renderer3D ref="r3d"
          canEdit={this.state.edit}
          annotations={this.state.annotations}
          localFiles={this.state.localFiles}
          remoteFiles={this.state.remoteFiles}
          selectedLabelChanged={this.handleSelectedLabelChanged}
        />
      </div>
    );
  }
}
