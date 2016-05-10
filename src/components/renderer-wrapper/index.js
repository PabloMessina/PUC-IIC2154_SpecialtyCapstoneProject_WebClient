import React, { Component } from 'react';
import Renderer3D from '../renderer-3d/';
import ToggleButton from './toggleButton';
import LabelStyleControl from './labelStyleControl';
import { ButtonToolbar, Button, Dropdown } from 'react-bootstrap';

const LIGHT_BLUE = '#9fdef7';
const BLACK = '#000000';
const WHITE = '#ffffff';
const BLUE = '#0000ff';

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
      remoteFiles: [
        // 'http://localhost:5000/M_10___Default1.jpg',
        // 'http://localhost:5000/nRBC.mtl',
        // 'http://localhost:5000/nRBC.obj',
        // 'https://lopezjuri.com/videos/M_10___Default1.jpg',
        // 'https://lopezjuri.com/videos/nRBC.mtl',
        // 'https://lopezjuri.com/videos/nRBC.obj',
        'https://lopezjuri.com/videos/Heart.mtl',
        'https://lopezjuri.com/videos/Heart.obj',
      ],
      highlightedLabelStyle: {
        font: 'Georgia',
        fontSize: 120,
        borderThickness: 5,
        borderColor: BLACK,
        backgroundColor: LIGHT_BLUE,
        foregroundColor: BLUE,
        worldFontSizeCoef: 1 / 18,
      },
      normalLabelStyle: {
        font: 'Georgia',
        fontSize: 150,
        borderThickness: 5,
        borderColor: BLACK,
        backgroundColor: WHITE,
        foregroundColor: BLACK,
        worldFontSizeCoef: 1 / 18,
      },
      labelCount: 0,
      labelStyleMode: 'normal',
      labelDropdownOpen: false,
      hasLoadedModel: false,
      hasSelectedLabel: false,
      showingLabels: true,
      loadingModel: false,
    };

    this._state = {
      labelDropdownX: null,
      labelDropdownY: null,
    };

    this.onFilesChanged = this.onFilesChanged.bind(this);
    this.refocusOnModel = this.refocusOnModel.bind(this);
    this.showLabels = this.showLabels.bind(this);
    this.hideLabes = this.hideLabes.bind(this);
    this.removeSelectedLabel = this.removeSelectedLabel.bind(this);
    this.onLabelCountChanged = this.onLabelCountChanged.bind(this);
    this.onLabelStyleChanged = this.onLabelStyleChanged.bind(this);
    this.onLabelRadioBtnChanged = this.onLabelRadioBtnChanged.bind(this);
    this.onLabelDropDownToggle = this.onLabelDropDownToggle.bind(this);
    this.onSelectedLabelChanged = this.onSelectedLabelChanged.bind(this);
    this.onLoadingStarting = this.onLoadingStarting.bind(this);
    this.onLoadingCompleted = this.onLoadingCompleted.bind(this);
    this.onLoadingProgress = this.onLoadingProgress.bind(this);
    this.onLoadingError = this.onLoadingError.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.onMouseDown);
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.onMouseDown);
  }

  onMouseDown(e) {
    this._state.lastClickedElem = e.target;
  }

  refocusOnModel() {
    this.refs.r3d.refocusOnModel();
  }

  showLabels() {
    this.refs.r3d.showLabels();
    this.setState({ showingLabels: true });
  }

  hideLabes() {
    this.refs.r3d.hideLabes();
    this.setState({ showingLabels: false });
  }

  removeSelectedLabel() {
    this.refs.r3d.removeSelectedLabel();
  }

  onLabelCountChanged(newCount) {
    this.setState({
      labelCount: newCount,
    });
  }

  onLabelStyleChanged(newLabelStyle) {
    switch (this.state.labelStyleMode) {
      case 'normal':
        this.setState({ normalLabelStyle: newLabelStyle });
        this.refs.r3d.setNormalLabelStyle(newLabelStyle);
        break;
      default: // highlighted
        this.setState({ highlightedLabelStyle: newLabelStyle });
        this.refs.r3d.setHighlightedLabelStyle(newLabelStyle);
        break;
    }
  }

  onLabelRadioBtnChanged() {
    const value = this.refs
      .labelSettingsDiv.querySelector('input[name=labelType]:checked').value;
    if (value === 'normal') {
      this.setState({ labelStyleMode: 'normal' });
    } else { // highlighted
      this.setState({ labelStyleMode: 'highlighted' });
    }
  }

  onLabelDropDownToggle(open) {
    if (!open) {
      let elem = this._state.lastClickedElem;
      while (elem) {
        if (elem === this.refs.labelSettingsDiv) return;
        elem = elem.parentElement;
      }
    }
    this.setState({ labelDropdownOpen: open });
  }

  onSelectedLabelChanged(label) {
    if (this.state.hasSelectedLabel !== !!label) {
      this.setState({ hasSelectedLabel: !!label });
    }
  }

  onFilesChanged() {
    const files = this.refs.filesInput.files;
    this.refs.r3d.loadModel(files, this.state.annotations);
  }

  onLoadingStarting() {
    this.setState({
      loadingModel: true,
      progressPercentage: 0,
      progressMessage: 'Beginning to load model ...',
    });
  }

  onLoadingProgress(message, lengthSoFar, totalLength) {
    const percentage = (lengthSoFar / totalLength * 100).toFixed(2);
    console.log("onLoadingProgress=",message,lengthSoFar,totalLength, percentage);
    this.setState({
      progressPercentage: percentage,
      progressMessage: `${message} ${percentage}%`,
    })
  }

  onLoadingCompleted() {
    this.setState({
      hasLoadedModel: true,
      loadingModel: false,
      showingLabels: true,
    });
  }

  onLoadingError(error) {
    console.log("===> onLoadingError(): error = ", error);
    alert(JSON.stringify(error));
    this.setState({
      loadingModel: false,
    });
  }

  render() {
    // check label style to use
    let initialLabelStyle;
    switch (this.state.labelStyleMode) {
      case 'normal':
        initialLabelStyle = this.state.normalLabelStyle;
        break;
      default: // highlighted
        initialLabelStyle = this.state.highlightedLabelStyle;
        break;
    }

    return (
      <div style={styles.globalDivStyle}>
        <input ref="filesInput" type="file" onChange={this.onFilesChanged} multiple></input>
        <ButtonToolbar>
          <Dropdown id="label-dropdown-custom" open={this.state.labelDropdownOpen}
            onToggle={this.onLabelDropDownToggle}
            ref="labelDropdown"
          >
            <Dropdown.Toggle bsRole="toggle" bsStyle="default" bsSize="small"
              className="dropdown-with-input dropdown-toggle"
            >
              Edit Label Styles
            </Dropdown.Toggle>
            <Dropdown.Menu className="super-colors">
              <div ref="labelSettingsDiv" style={styles.labelSettingsDivStyle}>
                <label><input type="radio" name="labelType" value="normal"
                  checked={this.state.labelStyleMode === 'normal'}
                  onChange={this.onLabelRadioBtnChanged}
                /> Normal Label
                </label>
                <br />
                <label><input type="radio" name="labelType" value="highlighted"
                  checked={this.state.labelStyleMode === 'highlighted'}
                  onChange={this.onLabelRadioBtnChanged}
                /> Highlighted Label
                </label>
                <hr />
                <LabelStyleControl
                  initialLabelStyle={initialLabelStyle}
                  labelStyleChangedCallback={this.onLabelStyleChanged}
                />
              </div>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            disabled={!this.state.hasLoadedModel}
            onClick={this.refocusOnModel} bsSize="small"
          >REFOCUS</Button>
          <ToggleButton
            enabled={this.state.labelCount > 0}
            disabledMessage="No labels in scene"
            turnedOnMessage="Hide Labels"
            turnedOffMessage="Show Labels"
            turnedOnCallback={this.showLabels}
            turnedOffCallback={this.hideLabes}
          />
          <Button
            disabled={!(this.state.hasSelectedLabel && this.state.showingLabels)}
            onClick={this.removeSelectedLabel} bsSize="small"
          >Remove Label</Button>
        </ButtonToolbar>
        <Renderer3D ref="r3d"
          canEdit={this.state.edit}
          annotations={this.state.annotations}
          remoteFiles={this.state.remoteFiles}
          normalLabelStyle={this.state.normalLabelStyle}
          highlightedLabelStyle={this.state.highlightedLabelStyle}
          labelCountChangedCallback={this.onLabelCountChanged}
          selectedLabelChangedCallback={this.onSelectedLabelChanged}
          loadingStartingCallback={this.onLoadingStarting}
          loadingProgressCallback={this.onLoadingProgress}
          loadingErrorCallback={this.onLoadingError}
          loadingCompletedCallback={this.onLoadingCompleted}
        />
        {this.state.loadingModel ? (<div style={styles.progressDiv}>
            <span height="20px">{this.state.progressMessage}</span> <br />
            <progress style={styles.progressBar} value={this.state.progressPercentage} max="100" />
        </div>) : null
        }
      </div>
    );
  }
}

const styles = {
  labelSettingsDivStyle: {
    width: '250px',
    padding: '10px',
  },
  globalDivStyle: {
    position: 'relative',
  },
  progressDiv: {
    width: '50%',
    position: 'absolute',
    left: '25%',
    top: '50%',
    backgroundColor: 'rgba(240,240,240,0.7)',
  },
  progressBar: {
    backgroundColor: '#f3f3f3',
    border: 0,
    height: '18px',
    borderRadius: '9px',
    width: '100%',
  },
  progressSpan: {
    fontSize: '20px',
  }
};
