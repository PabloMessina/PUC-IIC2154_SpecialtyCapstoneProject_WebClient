import React, { Component } from 'react';
import Renderer3D from '../renderer-3d/';
import ToggleButton from './toggleButton.js';

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
      labelCount: 0,
    };

    this.handleFilesChanged = this.handleFilesChanged.bind(this);
    this.refocusOnModel = this.refocusOnModel.bind(this);
    this.showLabels = this.showLabels.bind(this);
    this.hideLabes = this.hideLabes.bind(this);
    this.handleLabelCountChanged = this.handleLabelCountChanged.bind(this);
  }

  handleFilesChanged() {
    const files = this.refs.filesInput.files;
    this.refs.r3d.loadModel(files, this.state.annotations);
    this.setState({ localFiles: files });
  }

  /**
   * [refocusOnModel : refocus the camera on the model]
   */
  refocusOnModel() {
    this.refs.r3d.refocusOnModel();
  }

  showLabels() {
    this.refs.r3d.showLabels();
  }

  hideLabes() {
    this.refs.r3d.hideLabes();
  }

  handleLabelCountChanged(newCount) {
    this.setState({
      labelCount: newCount,
    });
  }

  render() {
    return (
      <div>
        <input ref="filesInput" type="file" onChange={this.handleFilesChanged} multiple></input>
        <button onClick={this.refocusOnModel}>REFOCUS</button>
        <ToggleButton
          enabled={this.state.labelCount > 0}
          disabledMessage="No labels in scene"
          turnedOnMessage="Hide Labels"
          turnedOffMessage="Show Labels"
          turnedOnCallback={this.showLabels}
          turnedOffCallback={this.hideLabes}
        />
        <Renderer3D ref="r3d"
          canEdit={this.state.edit}
          annotations={this.state.annotations}
          localFiles={this.state.localFiles}
          remoteFiles={this.state.remoteFiles}
          labelCountChanged={this.handleLabelCountChanged}
        />
      </div>
    );
  }
}
