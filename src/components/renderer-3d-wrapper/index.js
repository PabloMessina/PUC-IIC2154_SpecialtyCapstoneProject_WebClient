import React, { Component } from 'react';
import Renderer3D from '../renderer-3d/';
import ToggleButton from './toggleButton';
import LabelStyleControl from './labelStyleControl';
import { ButtonToolbar, Button, Dropdown } from 'react-bootstrap';
import renderIf from 'render-if';
import _ from 'lodash';

const LIGHT_BLUE = '#9fdef7';
const BLACK = '#000000';
const WHITE = '#ffffff';
const BLUE = '#0000ff';
const YELLOW = '#00ffff';
const GREEN = '#00ff00';

export default class RendererWrapper extends Component {

  static get defaultProps() {
    return {
      canEdit: false,
      remoteFiles: {
        // mtl: 'https://lopezjuri.com/videos/nRBC.mtl',
        // obj: 'https://lopezjuri.com/videos/nRBC.obj',
        // images: ['https://lopezjuri.com/videos/M_10___Default1.jpg'],
        mtl: 'https://lopezjuri.com/videos/Heart.mtl',
        obj: 'https://lopezjuri.com/videos/Heart.obj',
        images: [],
        // mtl: 'http://192.168.1.163:5000/nRBC.mtl',
        // obj: 'http://192.168.1.163:5000/nRBC.obj',
        // images: ['http://192.168.1.163:5000/nRBC.jpg'],
      },
      labels: [
        {
          points: [
            {
              x: 37.826095769242755,
              y: -17.566643210385312,
              z: 18.820864995762577,
            },
          ],
          position: {
            x: 49.84829253067862,
            y: 5.6762350999919,
            z: 52.898860960917204,
          },
          text: '',
        },
        {
          points: [
            {
              x: 7.745012480927347,
              y: -3.7296656967454576,
              z: 35.0531834103773,
            },
          ],
          position: {
            x: -86.31771042423424,
            y: 24.040124653667554,
            z: 69.13044214706474,
          },
          text: '33333',
        },
        {
          points: [
            {
              x: -24.952834201667635,
              y: -14.927536476092854,
              z: 19.655668405735582,
            },
          ],
          position: {
            x: -103.33844040856773,
            y: 2.0922419016680194,
            z: 53.73301264121483,
          },
          text: '22222',
        },
        {
          points: [
            {
              x: -29.879876379393995,
              y: 19.56257117882312,
              z: 1.1782289198417857,
            },
          ],
          position: {
            x: -71.56916451888993,
            y: -57.36548791730873,
            z: 35.255295823141296,
          },
          text: '1111',
        },
        {
          points: [
            {
              x: 2.3798031424778094,
              y: -37.01679781004535,
              z: 38.13023229669875,
            },
            {
              x: -29.930726073618043,
              y: 41.96187166454956,
              z: -0.7197234775878769,
            },
          ],
          position: {
            x: -3.5752896225011126,
            y: 27.502860909167406,
            z: 72.20866805285107,
          },
          text: '3453535',
        },
        {
          points: [
            {
              x: 5.673151717363854,
              y: -23.910251930552754,
              z: 40.35500374405001,
            },
          ],
          position: {
            x: -72.94110358801457,
            y: 68.7874877831534,
            z: 73.422915237148,
          },
          text: 'the quick brown fox jumps over the lazy dog',
        },
        {
          points: [
            {
              x: -18.730399968525084,
              y: 50.10878039668664,
              z: -0.395419868565682,
            },
            {
              x: 19.713204866675134,
              y: -26.151476218200646,
              z: 36.74636976833938,
            },
          ],
          position: {
            x: 69.94195081678534,
            y: 62.28517384369443,
            z: 34.833340982463255,
          },
          text: 'ddsfd',
        },
      ],
      highlightedLabelStyle: {
        font: 'Georgia',
        fontSize: 120,
        borderThickness: 5,
        borderColor: BLACK,
        backgroundColor: LIGHT_BLUE,
        foregroundColor: BLUE,
        sphereColor: YELLOW,
        lineColor: YELLOW,
        cornerRadiusCoef: 0.4,
        worldFontSizeCoef: 1 / 18,
      },
      normalLabelStyle: {
        font: 'Georgia',
        fontSize: 150,
        borderThickness: 5,
        borderColor: BLACK,
        backgroundColor: WHITE,
        foregroundColor: BLACK,
        sphereColor: GREEN,
        lineColor: BLACK,
        cornerRadiusCoef: 0.4,
        worldFontSizeCoef: 1 / 18,
      },
      labelsChangedCallback: () => { console.log("default wrapper::labelsChangedCallback()"); },
      highlightedLabelStyleChangedCallback: (style) => { console.log("highstyle = ", style); },
      normalLabelStyleChangedCallback: (style) => { console.log("normalstyle = ", style); },
    };
  }

  constructor(props) {
    super(props);
    // state used in render
    this.state = {
      labelCount: 0,
      labelStyleMode: 'normal',
      labelDropdownOpen: false,
      hasLoadedModel: false,
      hasSelectedLabel: false,
      showingLabels: true,
      loadingModel: false,
      labels: props.labels,
      remoteFiles: props.remoteFiles,
      normalLabelStyle: props.normalLabelStyle,
      highlightedLabelStyle: props.highlightedLabelStyle,
    };
    // state not used in render
    this.mystate = {
      labelDropdownX: null,
      labelDropdownY: null,
      lastClickedElem: null,
      componentUnmounted: false,
    };

    this.onFilesChanged = this.onFilesChanged.bind(this);
    this.refocusOnModel = this.refocusOnModel.bind(this);
    this.showLabels = this.showLabels.bind(this);
    this.hideLabes = this.hideLabes.bind(this);
    this.removeSelectedLabel = this.removeSelectedLabel.bind(this);
    this.onLabelsChanged = this.onLabelsChanged.bind(this);
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

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.labels, nextProps.labels) &&
      !_.isEqual(nextProps.labels, this.state.labels)) {
      this.setState({ labels: nextProps.labels });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.onMouseDown);
    this.mystate.componentUnmounted = true;
  }

  onMouseDown(e) {
    this.mystate.lastClickedElem = e.target;
  }

  onLabelCountChanged(newCount) {
    this.setState({
      labelCount: newCount,
    });
  }

  onLabelsChanged(labels) {
    // console.log("===> onLabelsChanged(): labels = ", JSON.stringify(labels, null, '\t'));
    if (!this.mystate.componentUnmounted) {
      this.props.labelsChangedCallback(labels);
      this.setState({
        labelCount: labels ? labels.length : 0,
        labels,
      });
    }
  }

  onLabelStyleChanged(newLabelStyle) {
    switch (this.state.labelStyleMode) {
      case 'normal':
        this.setState({ normalLabelStyle: newLabelStyle });
        this.refs.r3d.setNormalLabelStyle(newLabelStyle);
        this.props.normalLabelStyleChangedCallback(newLabelStyle);
        break;
      default: // highlighted
        this.setState({ highlightedLabelStyle: newLabelStyle });
        this.refs.r3d.setHighlightedLabelStyle(newLabelStyle);
        this.props.highlightedLabelStyleChangedCallback(newLabelStyle);
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
      let elem = this.mystate.lastClickedElem;
      while (elem) {
        if (elem === this.refs.labelSettingsDiv) return;
        elem = elem.parentElement;
      }
    }
    this.setState({ labelDropdownOpen: open });
  }

  onSelectedLabelChanged(label) {
    if (!this.mystate.componentUnmounted) {
      if (this.state.hasSelectedLabel !== !!label) {
        this.setState({ hasSelectedLabel: !!label });
      }
    }
  }

  onFilesChanged() {
    const files = this.refs.filesInput.files;
    this.setState({ labels: null });
    setTimeout(() => this.refs.r3d.loadModel(files, this.state.labels), 0);
  }

  onLoadingStarting() {
    if (!this.mystate.componentUnmounted) {
      this.setState({
        loadingModel: true,
        progressPercentage: 0,
        progressMessage: 'Beginning to load model ...',
      });
    }
  }

  onLoadingProgress(message, lengthSoFar, totalLength) {
    if (!this.mystate.componentUnmounted) {
      const percentage = (lengthSoFar / totalLength * 100).toFixed(2);
      this.setState({
        progressPercentage: percentage,
        progressMessage: `${message} ${percentage}%`,
      });
    }
  }

  onLoadingCompleted() {
    if (!this.mystate.componentUnmounted) {
      this.setState({
        hasLoadedModel: true,
        loadingModel: false,
        showingLabels: true,
      });
    }
  }

  onLoadingError(error) {
    console.log(error);
    alert(error);
    if (!this.mystate.componentUnmounted) {
      this.setState({
        loadingModel: false,
      });
    }
  }

  showLabels() {
    this.refs.r3d.showLabels();
    this.setState({ showingLabels: true });
  }

  refocusOnModel() {
    this.refs.r3d.refocusOnModel();
  }

  hideLabes() {
    this.refs.r3d.hideLabes();
    this.setState({ showingLabels: false });
  }

  removeSelectedLabel() {
    this.refs.r3d.removeSelectedLabel();
  }

  render() {
    // check label style to use
    const { readOnly } = this.props.blockProps;
    let labelStyle;
    switch (this.state.labelStyleMode) {
      case 'normal':
        labelStyle = this.state.normalLabelStyle;
        break;
      default: // highlighted
        labelStyle = this.state.highlightedLabelStyle;
        break;
    }

    return (
      <div style={styles.globalDivStyle}>
        {renderIf(!readOnly)(() => (
          <input ref="filesInput" type="file" onChange={this.onFilesChanged} multiple></input>
        ))}
        <ButtonToolbar style={styles.toolbar}>
          {renderIf(!readOnly)(() => (
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
                    labelStyle={labelStyle}
                    labelStyleChangedCallback={this.onLabelStyleChanged}
                  />
                </div>
              </Dropdown.Menu>
            </Dropdown>
          ))}
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
          {renderIf(readOnly)(() => (
            <Button
              disabled={!(this.state.hasSelectedLabel && this.state.showingLabels)}
              onClick={this.removeSelectedLabel} bsSize="small"
            >Remove Label</Button>
          ))}
        </ButtonToolbar>
        <Renderer3D
          ref="r3d"
          canEdit={!readOnly}
          remoteFiles={this.props.remoteFiles}
          labels={this.state.labels}
          normalLabelStyle={this.state.normalLabelStyle}
          highlightedLabelStyle={this.state.highlightedLabelStyle}
          labelsChangedCallback={this.onLabelsChanged}
          selectedLabelChangedCallback={this.onSelectedLabelChanged}
          loadingStartingCallback={this.onLoadingStarting}
          loadingProgressCallback={this.onLoadingProgress}
          loadingErrorCallback={this.onLoadingError}
          loadingCompletedCallback={this.onLoadingCompleted}
        />
        {renderIf(this.state.loadingModel)(() => (
          <div style={styles.progressDiv}>
            <span height="20px">{this.state.progressMessage}</span> <br />
            <progress style={styles.progressBar} value={this.state.progressPercentage} max="100" />
          </div>
        ))}
      </div>
    );
  }
}

RendererWrapper.propTypes = {
  // optional props
  canEdit: React.PropTypes.bool,
  remoteFiles: React.PropTypes.object,
  labels: React.PropTypes.array,
  highlightedLabelStyle: React.PropTypes.object,
  normalLabelStyle: React.PropTypes.object,
  // required props
  labelsChangedCallback: React.PropTypes.func.isRequired,
  highlightedLabelStyleChangedCallback: React.PropTypes.func.isRequired,
  normalLabelStyleChangedCallback: React.PropTypes.func.isRequired,
};

const styles = {
  labelSettingsDivStyle: {
    width: '250px',
    padding: '10px',
  },
  globalDivStyle: {
    position: 'relative',
  },
  toolbar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
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
  },
};
