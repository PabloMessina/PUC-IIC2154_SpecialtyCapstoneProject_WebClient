import React, { Component } from 'react';
import Renderer3D from '../renderer-3d/';
import ToggleButton from '../toggle-button';
import LabelStyleControl from './labelStyleControl';
import { Button, Dropdown } from 'react-bootstrap';
import renderIf from 'render-if';
import Icon, { IconStack } from 'react-fa';
import clone from 'lodash/clone';

const LIGHT_BLUE = '#9fdef7';
const BLACK = '#000000';
const WHITE = '#ffffff';
const BLUE = '#0000ff';
const YELLOW = '#00ffff';
const GREEN = '#00ff00';

// modes
const MODES = {
  EVALUATION: 'EVALUATION',
  EDITION: 'EDITION',
  READONLY: 'READONLY',
};

const defaultHighlightedLabelStyle = {
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
};

const defaultNormalLabelStyle = {
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
};

const defaultSphereRadiusCoef = 1 / 200;

const defaultLabels = [];

export default class Renderer3DWrapper extends Component {

  static get defaultProps() {
    return {
      blockProps: {
        mode: MODES.EDITION,
        source: {
          remoteFiles: {
            mtl: 'https://lopezjuri.com/videos/nRBC.mtl',
            obj: 'https://lopezjuri.com/videos/nRBC.obj',
            images: ['https://lopezjuri.com/videos/M_10___Default1.jpg'],
            // mtl: 'https://lopezjuri.com/videos/Heart.mtl',
            // obj: 'https://lopezjuri.com/videos/Heart.obj',
            // images: [],
            // mtl: 'http://localhost:5000/nRBC.mtl',
            // obj: 'http://localhost:5000/nRBC.obj',
            // images: ['http://localhost:5000/nRBC.jpg'],
          },
          // localFiles: [mtl, obj, image1, image2, ... ]
          // },
        },
        metadata: {
          labels: JSON.parse(`[{"id":1,"points":[{"x":0.08011267886422502,"y":1.7630375099710704,
            "z":0.2855099769166429},{"x":0.07996274114879043,"y":1.7642502742242812,"z":-0.24056268813839665}],
            "position":{"x":-1.2019907948864557,"y":2.368970534761047,"z":-0.06227645813365079},
            "text":"shoulders"},{"id":2,"points":[{"x":0.03834693213218543,"y":1.643665271571109,
            "z":-0.9189726189875955}],"position":{"x":0.5210503123113313,"y":2.325146086504418,"z":-1.4203780284125997},
            "text":"left hand"},{"id":3,"points":[{"x":0.05562013466743565,"y":1.6404827763992103,
            "z":0.9533487794309679}],"position":{"x":0.18885065242216115,"y":2.2365201279125415,"z":1.2479100379638908},
            "text":"right hand"},{"id":4,"points":[{"x":0.1636169699651191,"y":0.6388932187009857,
            "z":-0.07602061097736623}, {"x":0.18297738656877982,"y":0.6669522616368795,"z":0.12959693525661464}],
            "position":{"x":1.0465285433723466, "y":0.5071482887253147,"z":0.07387170013075206},"text":"knees"},
            {"id":5,"points":[{"x":-0.38885138245308326, "y":1.5720951288809317,"z":0.05662421976961696}],
            "position":{"x":-1.2029175571224187,"y":1.5549022450299006,
            "z":-0.011820433183759249},"text":"backpack"},{"id":6,"points":[{"x":0.004955719812194559,
            "y":2.051210552175462,"z":0.009528489769337511}],"position":{"x":0.5725380247647536,
            "y":2.6584205095426796,"z":0.011737539989184143},"text":"head"}]`),
          highlightedLabelStyle: defaultHighlightedLabelStyle,
          normalLabelStyle: defaultNormalLabelStyle,
          sphereRadiusCoef: defaultSphereRadiusCoef,
        },
        gotFocusCallback: () => {},
        lostFocusCallback: () => {},
        onMetadataChanged: () => console.log('===> metadata changed'),

        // EDITION mode only
        onLabelAnswerChanged: (ans) => console.log(ans),
      },
    };
  }

  constructor(props) {
    super(props);
    const { mode, metadata } = props.blockProps;
    // state used in render
    this.state = {
      mode,
      metadata,
      labelStyleMode: 'normal',
      labelDropdownOpen: false,
      hasLoadedModel: false,
      showingLabels: true,
      loadingModel: false,
      downloading: false,
      downloadMessage: '',
      labelStyleControlShowAllOptions: false,
    };
    // state not used in render
    this._ = {
      lastClickedElem: null,
      componentUnmounted: false,
      componentFocused: false,
    };

    this.refocusOnModel = this.refocusOnModel.bind(this);
    this.showLabels = this.showLabels.bind(this);
    this.hideLabels = this.hideLabels.bind(this);
    this.removeSelectedLabel = this.removeSelectedLabel.bind(this);
    this.onLabelsChanged = this.onLabelsChanged.bind(this);
    this.onLabelStyleChanged = this.onLabelStyleChanged.bind(this);
    this.onLabelRadioBtnChanged = this.onLabelRadioBtnChanged.bind(this);
    this.onLabelDropDownToggle = this.onLabelDropDownToggle.bind(this);
    this.onLoadingStarting = this.onLoadingStarting.bind(this);
    this.onLoadingCompleted = this.onLoadingCompleted.bind(this);
    this.onLoadingProgress = this.onLoadingProgress.bind(this);
    this.onLoadingError = this.onLoadingError.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onLabelStyleControlCheckboxChanged = this.onLabelStyleControlCheckboxChanged.bind(this);
    this.onDownloadCycleStarted = this.onDownloadCycleStarted.bind(this);
    this.onDownloadCycleFinished = this.onDownloadCycleFinished.bind(this);
    this.onDownloadingFile = this.onDownloadingFile.bind(this);
    this.onSphereRadiusCoefChanged = this.onSphereRadiusCoefChanged.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.checkInComponente = this.checkInComponente.bind(this);

    /* =================== */
    /* EVALUATION MODE API */
    /* =================== */
    this.updateLabelAnswers = this.updateLabelAnswers.bind(this);
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.onMouseDown);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ metadata: nextProps.blockProps.metadata });
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.onMouseDown);
    this._.componentUnmounted = true;
  }

  onMouseDown(e) {
    this._.lastClickedElem = e.target;
    this.checkInComponente(e.target);
  }

  onTouchStart(e) {
    this._.lastClickedElem = e.target;
    this.checkInComponente(e.target);
  }

  onLabelsChanged(labels) {
    console.log('====> onLabelsChanged()');
    // console.log(JSON.stringify(labels));
    // if we run out of labels, no need to keep holding focus
    if (labels.length === 0 && this._.labelWithFocus) {
      this._.labelWithFocus = false;
      this.props.blockProps.lostFocusCallback();
    }
    if (!this._.componentUnmounted) {
      // update state  and notify parent
      const { metadata } = this.state;
      metadata.labels = labels;
      this.setState({ metadata }, () => this.props.blockProps.onMetadataChanged(metadata));
    }
  }

  onLabelStyleChanged(newLabelStyle) {
    console.log('====> onLabelStyleChanged()');
    const { metadata, labelStyleMode } = this.state;
    // update state and notify parent
    if (labelStyleMode === 'normal') metadata.normalLabelStyle = clone(newLabelStyle);
    else metadata.highlightedLabelStyle = clone(newLabelStyle);
    this.setState({ metadata }, () => this.props.blockProps.onMetadataChanged(metadata));
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
      let elem = this._.lastClickedElem;
      while (elem) {
        if (elem === this.refs.labelSettingsDiv) return;
        elem = elem.parentElement;
      }
    }
    this.setState({ labelDropdownOpen: open });
  }

  onLoadingStarting() {
    if (this._.componentUnmounted) return;
    this.setState({
      loadingModel: true,
      progressPercentage: 0,
      progressMessage: 'Beginning to load model ...',
    });
  }

  onDownloadCycleStarted() {
    if (this._.componentUnmounted) return;
    this.setState({ downloading: true });
  }

  onDownloadCycleFinished() {
    if (this._.componentUnmounted) return;
    this.setState({ downloading: false });
  }

  onDownloadingFile(path) {
    if (this._.componentUnmounted) return;
    this.setState({ downloadMessage: `fetching file: ${path}` });
  }

  onLoadingProgress(message, lengthSoFar, totalLength) {
    if (this._.componentUnmounted) return;
    const percentage = (lengthSoFar / totalLength * 100).toFixed(2);
    this.setState({
      progressPercentage: percentage,
      progressMessage: `${message} ${percentage}%`,
    });
  }

  onLoadingCompleted() {
    if (this._.componentUnmounted) return;
    this.setState({
      hasLoadedModel: true,
      loadingModel: false,
      showingLabels: true,
    });
  }

  onLoadingError(error) {
    console.log(error);
    alert(error);
    if (!this._.componentUnmounted) {
      this.setState({
        loadingModel: false,
        downloading: false,
      });
    }
  }

  onLabelStyleControlCheckboxChanged() {
    this.setState({ labelStyleControlShowAllOptions: this.refs.labelStyleControlCheckbox.checked });
  }

  /* handle change on sphere radius coef */
  onSphereRadiusCoefChanged(e) {
    console.log('====> onSphereRadiusCoefChanged()');
    const coef = Number(e.target.value);
    const { metadata } = this.state;
    // update state and notify parent
    metadata.sphereRadiusCoef = coef;
    this.setState({ metadata }, () => this.props.blockProps.onMetadataChanged(metadata));
  }

  showLabels() {
    this.refs.r3d.showLabels();
    this.setState({ showingLabels: true });
  }

  refocusOnModel() {
    this.refs.r3d.refocusOnModel();
  }

  hideLabels() {
    this.refs.r3d.hideLabels();
    this.setState({ showingLabels: false });
  }

  removeSelectedLabel() {
    this.refs.r3d.removeSelectedLabel();
  }

  checkInComponente(element) {
    let inComponent = false;
    let elem = element;
    while (elem) {
      if (elem === this.refs.root) { inComponent = true; break; }
      elem = elem.parentElement;
    }
    if (!inComponent) this.refs.r3d.unselectSelectedLabel();
    if (inComponent && !this._.componentFocused) {
      this._.componentFocused = true;
      this.refs.r3d.gotFocus();
      if (this.state.mode === MODES.EDITION) this.props.blockProps.gotFocusCallback();
    } else if (!inComponent && this._.componentFocused) {
      this._.componentFocused = false;
      this.refs.r3d.lostFocus();
      if (this.state.mode === MODES.EDITION) this.props.blockProps.lostFocusCallback();
    }
  }

  updateLabelAnswers(answers) {
    this.refs.r3d.updateLabelAnswers(answers);
  }

  render() {
    // extract from props
    const { source } = this.props.blockProps;
    // extract from state
    const { metadata, mode, labelStyleMode } = this.state;
    // set defaults
    const normalLabelStyle = metadata.normalLabelStyle || defaultNormalLabelStyle;
    const highlightedLabelStyle = metadata.highlightedLabelStyle || defaultHighlightedLabelStyle;
    const labels = metadata.labels || defaultLabels;
    const sphereRadiusCoef = metadata.sphereRadiusCoef || defaultSphereRadiusCoef;

    // check label style to use
    let labelStyle;
    switch (labelStyleMode) {
      case 'normal':
        labelStyle = normalLabelStyle;
        break;
      default: // highlighted
        labelStyle = highlightedLabelStyle;
        break;
    }
    // check if it is edition
    const isEdition = mode === MODES.EDITION;
    // check if it has labels
    const hasLabels = labels.length > 0;

    return (
      <div ref="root" style={styles.globalDivStyle}>
        <div style={styles.toolbar}>
          <Button
            style={styles.toolbarButton}
            disabled={!this.state.hasLoadedModel}
            onClick={this.refocusOnModel} bsSize="small"
          >
            <IconStack size="2x">
              <Icon name="circle" stack="2x" />
              <Icon name="compass" stack="1x" style={styles.icon} />
            </IconStack>
          </Button>
          {renderIf(hasLabels)(() => (
            <ToggleButton
              turnedOnIcon="eye"
              turnedOffIcon="eye-slash"
              turnedOnCallback={this.showLabels}
              turnedOffCallback={this.hideLabels}
              iconStyle={styles.icon}
              buttonStyle={styles.toolbarButton}
            />
          ))}
          {renderIf(hasLabels)(() => (
            <Button
              style={styles.toolbarButton}
              onClick={() => this.refs.r3d.minimizeAllLabels()} bsSize="small"
            >
              <IconStack size="2x">
                <Icon name="circle" stack="2x" />
                <Icon name="minus-square" stack="1x" style={styles.icon} />
              </IconStack>
            </Button>
          ))}
          {renderIf(hasLabels)(() => (
            <Button
              style={styles.toolbarButton}
              onClick={() => this.refs.r3d.maximizeAllLabels()} bsSize="small"
            >
              <IconStack size="2x">
                <Icon name="circle" stack="2x" />
                <Icon name="plus-square" stack="1x" style={styles.icon} />
              </IconStack>
            </Button>
          ))}
          {renderIf(hasLabels && isEdition)(() => (
            <Dropdown
              id="label-dropdown-custom"
              open={this.state.labelDropdownOpen}
              onToggle={this.onLabelDropDownToggle}
              ref="labelDropdown"
              dropup
              pullRight
            >
              <Dropdown.Toggle
                style={styles.toolbarButton}
                bsRole="toggle"
                bsStyle="default"
                bsSize="small"
                className="dropdown-with-input dropdown-toggle"
              >
                <IconStack size="2x">
                  <Icon name="circle" stack="2x" />
                  <Icon name="cog" stack="1x" style={styles.icon} />
                </IconStack>
              </Dropdown.Toggle>
              <Dropdown.Menu className="super-colors">
                <div ref="labelSettingsDiv" style={styles.labelSettingsDivStyle}>
                  <label> SphereRadiusCoef: </label><br />
                  <input
                    type="range" min={0.001} max={0.03} step={0.0005} style={styles.rangeInput}
                    value={sphereRadiusCoef} onChange={this.onSphereRadiusCoefChanged}
                  />
                  <span>{sphereRadiusCoef.toFixed(5)}</span>
                  <div style={styles.flexme}>
                    <label style={styles.normalLabel}><input
                      type="radio" name="labelType" value="normal"
                      checked={this.state.labelStyleMode === 'normal'}
                      onChange={this.onLabelRadioBtnChanged}
                    /> Normal Label
                    </label>
                    <label style={styles.highlightLabel}><input
                      type="radio" name="labelType" value="highlighted"
                      checked={this.state.labelStyleMode === 'highlighted'}
                      onChange={this.onLabelRadioBtnChanged}
                    /> Highlighted Label
                    </label>
                  </div>
                  <label><input
                    ref="labelStyleControlCheckbox"
                    type="checkbox"
                    checked={this.state.labelStyleControlShowAllOptions}
                    onChange={this.onLabelStyleControlCheckboxChanged}
                  /> show all options
                  </label>
                  <LabelStyleControl
                    labelStyle={labelStyle}
                    labelStyleChangedCallback={this.onLabelStyleChanged}
                    showAllOptions={this.state.labelStyleControlShowAllOptions}
                  />
                </div>
              </Dropdown.Menu>
            </Dropdown>
          ))}
        </div>
        <Renderer3D
          ref="r3d"
          mode={mode}
          source={source}
          labels={labels}
          normalLabelStyle={normalLabelStyle}
          highlightedLabelStyle={highlightedLabelStyle}
          sphereRadiusCoef={sphereRadiusCoef}
          labelsChangedCallback={this.onLabelsChanged}
          loadingStartingCallback={this.onLoadingStarting}
          loadingProgressCallback={this.onLoadingProgress}
          loadingErrorCallback={this.onLoadingError}
          loadingCompletedCallback={this.onLoadingCompleted}
          downloadCycleStartedCallback={this.onDownloadCycleStarted}
          downloadCycleFinishedCallback={this.onDownloadCycleFinished}
          downloadingFileCallback={this.onDownloadingFile}

          // in EVALUATION mode
          labelAnswerChangedCallback={this.props.blockProps.onLabelAnswerChanged}
        />
        {this.state.loadingModel ?
          <div style={styles.progressDiv}>
            <span height="20px">{this.state.progressMessage}</span> <br />
            <progress style={styles.progressBar} value={this.state.progressPercentage} max="100" />
          </div> : null}
        {this.state.downloading ? (
          <div style={styles.spinnerDiv}>
            <div className="download-spinner" /><span height="20px">{this.state.downloadMessage}</span>
          </div>
        ) : null}
        <style
          dangerouslySetInnerHTML={{
            __html:
              `.download-spinner {
                display: inline-block;
                border: 16px solid #f3f3f3;
                border-radius: 50%;
                border-top: 16px solid #3498db;
                width: 20px;
                height: 20px;
                -webkit-animation: spin 1s linear infinite;
                animation: spin 1s linear infinite;
              }
              @-webkit-keyframes spin {
                0% { -webkit-transform: rotate(0deg); }
                100% { -webkit-transform: rotate(360deg); }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }`,
          }}
        />
      </div>
    );
  }
}

Renderer3DWrapper.propTypes = {
  blockProps: React.PropTypes.object.isRequired,
};

const styles = {
  rangeInput: {
    width: '140px',
    display: 'inline',
    marginRight: '10px',
  },
  filesInput: {
    position: 'absolute',
    left: 5,
    bottom: 4,
    fontFamily: 'Times New Roman',
    fontSize: '11px',
    color: 'black',
  },
  flexme: {
    display: 'flex',
  },
  labelSettingsDivStyle: {
    width: '270px',
    height: '285px',
    padding: '10px',
  },
  normalLabel: {
  },
  highlightLabel: {
    marginLeft: 'auto',
  },
  globalDivStyle: {
    position: 'relative',
    width: '85%',
  },
  toolbar: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    height: 44,
  },
  toolbarButton: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    padding: 3,
  },
  icon: {
    color: 'white',
  },
  progressDiv: {
    width: '50%',
    position: 'absolute',
    left: '25%',
    top: '38%',
    backgroundColor: 'rgba(240,240,240,0.7)',
    fontFamily: 'Times New Roman',
    fontSize: 14,
  },
  spinnerDiv: {
    width: '50%',
    position: 'absolute',
    left: '25%',
    top: '38%',
    backgroundColor: 'rgba(240,240,240,0.7)',
    fontFamily: 'Times New Roman',
    fontSize: 14,
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
