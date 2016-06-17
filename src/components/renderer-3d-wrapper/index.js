import React, { Component } from 'react';
import Renderer3D from '../renderer-3d/';
import ToggleButton from './toggleButton';
import LabelStyleControl from './labelStyleControl';
import { Button, Dropdown } from 'react-bootstrap';
import renderIf from 'render-if';
import Icon, { IconStack } from 'react-fa';
import isEqual from 'lodash/isEqual';

const LIGHT_BLUE = '#9fdef7';
const BLACK = '#000000';
const WHITE = '#ffffff';
const BLUE = '#0000ff';
const YELLOW = '#00ffff';
const GREEN = '#00ff00';

export default class Renderer3DWrapper extends Component {

  static get defaultProps() {
    return {
      canEdit: true,
      blockProps: {
        readOnly: false,
        gotFocusCallback: () => {},
        lostFocusCallback: () => {},
      },
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
      		"points": [
      			{
      				"x": -21.214546463347062,
      				"y": 57.65000469461012,
      				"z": -14.500255495662856
      			},
      			{
      				"x": -13.411042799001905,
      				"y": 55.21806218247605,
      				"z": -20.158860003288254
      			},
      			{
      				"x": -11.029465274949757,
      				"y": 56.17479942634964,
      				"z": -26.745239529768
      			}
      		],
      		"position": {
      			"x": 7.294952759821058,
      			"y": 98.37410094400764,
      			"z": -34.27216229513908
      		},
      		"text": "Aorta"
      	},
      	{
      		"points": [
      			{
      				"x": -32.865710734028255,
      				"y": 57.31516519540327,
      				"z": -5.177062605672859
      			}
      		],
      		"position": {
      			"x": -40.926209510856694,
      			"y": 102.35977727702405,
      			"z": 17.21597701425094
      		},
      		"text": "Superior Vena Cava"
      	},
      	{
      		"points": [
      			{
      				"x": 21.479502800811872,
      				"y": 23.264175125980444,
      				"z": -27.43319398133451
      			},
      			{
      				"x": 17.815957441906733,
      				"y": 25.314838170859986,
      				"z": -16.986192330773633
      			}
      		],
      		"position": {
      			"x": 72.20902901768375,
      			"y": 58.636991283386095,
      			"z": -42.23733762885104
      		},
      		"text": "Pulmonary Artery"
      	},
      	{
      		"points": [
      			{
      				"x": 26.638758956953495,
      				"y": 11.398709932821731,
      				"z": -32.409418235321596
      			},
      			{
      				"x": 28.031732184599036,
      				"y": 2.7975700848757015,
      				"z": -34.61691697827138
      			}
      		],
      		"position": {
      			"x": 95.87746867890667,
      			"y": 29.876116264481254,
      			"z": -60.621318380953426
      		},
      		"text": "Pulmonary Vein"
      	},
      	{
      		"points": [
      			{
      				"x": -33.03240522235461,
      				"y": -40.93038856010884,
      				"z": -23.50147817220028
      			}
      		],
      		"position": {
      			"x": -74.27396086352269,
      			"y": -74.3037089604203,
      			"z": -58.297210334662516
      		},
      		"text": "Inferior Vena Cava"
      	}
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
      labelsChangedCallback: () => console.log("default wrapper::labelsChangedCallback()"),
      highlightedLabelStyleChangedCallback: (style) => console.log("highstyle = ", style),
      normalLabelStyleChangedCallback: (style) => console.log("normalstyle = ", style),
      gotFocusCallback: () => console.log("gotFocusCallback()"),
      lostFocusCallback: () => console.log("lostFocusCallback()"),
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
      normalLabelStyle: props.normalLabelStyle,
      highlightedLabelStyle: props.highlightedLabelStyle,
    };
    // state not used in render
    this.mystate = {
      labelDropdownX: null,
      labelDropdownY: null,
      lastClickedElem: null,
      componentUnmounted: false,
      labelWithFocus: false,
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
    if (!isEqual(this.props.labels, nextProps.labels) &&
      !isEqual(nextProps.labels, this.state.labels)) {
      this.setState({ labels: nextProps.labels });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.onMouseDown);
    this.mystate.componentUnmounted = true;
  }

  onMouseDown(e) {
    let elem = e.target;
    this.mystate.lastClickedElem = elem;
    // if click is outside wrapper, unselect selected label
    let inComponent = false;
    while (elem) {
      if (elem === this.refs.root) {
        inComponent = true;
        break;
      }
      elem = elem.parentElement;
    }
    if (!inComponent) {
      this.refs.r3d.unselectSelectedLabel();
    }
  }

  onLabelCountChanged(newCount) {
    this.setState({
      labelCount: newCount,
    });
  }

  onLabelsChanged(labels) {
    // console.log("===> onLabelsChanged(): labels = ", JSON.stringify(labels, null, '\t'));
    if (labels.length === 0 && this.mystate.labelWithFocus) {
      this.mystate.labelWithFocus = false;
      console.log("----------------------");
      console.log("onLabelsChanged()");
      this.props.blockProps.lostFocusCallback();
    }
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
      const { gotFocusCallback, lostFocusCallback } = this.props.blockProps;
      // check focus state
      if (label && !this.mystate.labelWithFocus) {
        this.mystate.labelWithFocus = true;
        console.log("----------------------");
        console.log("onSelectedLabelChanged()");
        gotFocusCallback();
      } else if (!label && this.mystate.labelWithFocus) {
        this.mystate.labelWithFocus = false;
        console.log("----------------------");
        console.log("onSelectedLabelChanged()");
        lostFocusCallback();
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
    const { readOnly, remoteFiles } = this.props.blockProps;
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
      <div ref="root" style={styles.globalDivStyle}>
        {renderIf(false && !readOnly)(() => (
          <input ref="filesInput" type="file" onChange={this.onFilesChanged} multiple></input>
        ))}
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
          {renderIf(this.state.labelCount > 0)(() => (
            <ToggleButton
              turnedOnIcon="eye"
              turnedOffIcon="eye-slash"
              turnedOnCallback={this.showLabels}
              turnedOffCallback={this.hideLabes}
              iconStyle={styles.icon}
              buttonStyle={styles.toolbarButton}
            />
          ))}
          {renderIf(!readOnly)(() => (
            <Button
              style={styles.toolbarButton}
              disabled={!(this.state.hasSelectedLabel && this.state.showingLabels)}
              onClick={this.removeSelectedLabel} bsSize="small"
            >
              <IconStack size="2x">
                <Icon name="circle" stack="2x" />
                <Icon name="trash" stack="1x" style={styles.icon} />
              </IconStack>
            </Button>
          ))}
          {renderIf(!readOnly)(() => (
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
                  <Icon name="circle" stack="2x"/>
                  <Icon name="cog" stack="1x" style={styles.icon} />
                </IconStack>
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
        </div>
        <Renderer3D
          ref="r3d"
          canEdit={!readOnly}
          remoteFiles={remoteFiles}
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

Renderer3DWrapper.propTypes = {
  // optional props
  canEdit: React.PropTypes.bool,
  remoteFiles: React.PropTypes.object,
  labels: React.PropTypes.array,
  highlightedLabelStyle: React.PropTypes.object,
  normalLabelStyle: React.PropTypes.object,
  gotFocusCallback: React.PropTypes.func,
  lostFocusCallback: React.PropTypes.func,
  // required props
  labelsChangedCallback: React.PropTypes.func.isRequired,
  highlightedLabelStyleChangedCallback: React.PropTypes.func.isRequired,
  normalLabelStyleChangedCallback: React.PropTypes.func.isRequired,
  // vicho's props
  blockProps: React.PropTypes.object.isRequired,
};

const styles = {
  labelSettingsDivStyle: {
    width: '250px',
    padding: '10px',
  },
  globalDivStyle: {
    position: 'relative',
    width: '70%',
  },
  toolbar: {
    position: 'absolute',
    right: 0,
    bottom: 60,
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
