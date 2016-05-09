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
      localFiles: null,
      remoteFiles: null,
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
    this.onModelLoaded = this.onModelLoaded.bind(this);
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

  onFilesChanged() {
    const files = this.refs.filesInput.files;
    this.refs.r3d.loadModel(files, this.state.annotations);
    this.setState({ localFiles: files });
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

  onModelLoaded() {
    if (!this.state.hasLoadedModel) this.setState({ hasLoadedModel: true });
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
      <div>
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
            onClick={this.removeSelectedLabel}
          >Remove Label</Button>
        </ButtonToolbar>
        <Renderer3D ref="r3d"
          canEdit={this.state.edit}
          annotations={this.state.annotations}
          localFiles={this.state.localFiles}
          remoteFiles={this.state.remoteFiles}
          normalLabelStyle={this.state.normalLabelStyle}
          highlightedLabelStyle={this.state.highlightedLabelStyle}
          labelCountChangedCallback={this.onLabelCountChanged}
          selectedLabelChangedCallback={this.onSelectedLabelChanged}
          modelLoadedCallback={this.onModelLoaded}
        />
      </div>
    );
  }
}

const styles = {
  labelSettingsDivStyle: {
    width: '250px',
    padding: '10px',
  },
};
