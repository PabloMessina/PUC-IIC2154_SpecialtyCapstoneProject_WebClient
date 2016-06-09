import React, { Component } from 'react';
import ImageWithLabels from '../image-with-labels/';
import renderIf from 'render-if';
import { Button, Dropdown } from 'react-bootstrap';
import Icon, { IconStack } from 'react-fa';
import ToggleButton from '../toggle-button/';

export default class ImageWithLabelsWrapper extends Component {

  static get defaultProps() {
    return {
      url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg',
      blockProps: {
        mode: 'EDITION',
        gotFocusCallback: () => {},
        lostFocusCallback: () => {},
      },
      circleRadius: 4,
      labels: [{"regions":[{"type":"C","x":0.328,"y":0.6201923076923077,"id":0,"string":"1"},{"type":"C","x":0.652,"y":0.6225961538461539,"id":1,"string":"2"}],"x":0.524,"y":0.25,"text":"label 1","id":0},{"regions":[{"type":"P","points":[{"x":0.772,"y":0.5528846153846154},{"x":0.838,"y":0.7932692307692307},{"x":0.932,"y":0.6225961538461539}],"x":0.847333333333334,"y":0.6562500000000004,"id":2,"string":"3"},{"type":"P","points":[{"x":0.198,"y":0.5072115384615384},{"x":0.082,"y":0.6105769230769231},{"x":0.224,"y":0.7235576923076923}],"x":0.16799999999999993,"y":0.6137820512820512,"id":3,"string":"4"}],"x":0.506,"y":0.8701923076923077,"text":"label 2","id":1}],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      source: props.url ? { url: props.url } : null,
      circleRadius: props.circleRadius,
      showLabels: true,
      labelCount: props.labels ? props.labels.length : 0,
    };
    this.onFileChanged = this.onFileChanged.bind(this);
    this.onGotFocus = this.onGotFocus.bind(this);
    this.onLostFocus = this.onLostFocus.bind(this);
    this.onCircleRadiusChanged = this.onCircleRadiusChanged.bind(this);
    this.onLabelsChanged = this.onLabelsChanged.bind(this);
    this.showLabels = this.showLabels.bind(this);
    this.hideLabels = this.hideLabels.bind(this);
  }

  onFileChanged() {
    const file = this.refs.fileInput.files[0];
    if (file) this.setState({ source: { file } });
  }

  onGotFocus() {
    this.props.blockProps.gotFocusCallback();
  }

  onLostFocus() {
    this.props.blockProps.lostFocusCallback();
  }

  onCircleRadiusChanged(e) {
    this.setState({ circleRadius: Number(e.target.value) });
  }

  onLabelsChanged(labels) {
    console.log('labels = ', JSON.stringify(labels));
    this.setState({ labelCount: labels.length });
  }

  showLabels() {
    this.setState({ showLabels: true });
  }

  hideLabels() {
    this.setState({ showLabels: false });
  }

  renderLabel(args) {
    // general args
    const { mode, ref, key, label, style } = args;
    if (mode === 'READONLY') {
      // readonly mode args
      const { onMinimize } = args;
      return (
        <div style={style} ref={ref} key={key}>
          <div style={styles.label.innerDiv}>
            <a href="#" style={styles.label.minimizeButton} onClick={onMinimize}>-</a>
            <input
              style={styles.label.input}
              defaultValue={label.text}
              readOnly
            />
          </div>
        </div>
      );
    } else if (mode === 'EDITION') {
      // edition mode args
      const { focusId, onTextChanged, onKeyDown, onMinimize, onClose } = args;
      return (
        <div style={style} ref={ref} key={key}>
          <div style={styles.label.innerDiv}>
            <a href="#" style={styles.label.minimizeButton} onClick={onMinimize}>-</a>
            <a href="#" style={styles.label.closeButton} onClick={onClose}>x</a>
            <input
              style={styles.label.input}
              id={focusId}
              defaultValue={label.text}
              onChange={onTextChanged}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      );
    } else if (mode === 'WRITEANSWER') {
      // writeanswer mode args
      const { focusId, onTextChanged, onKeyDown, onMinimize } = args;
      return (
        <div style={style} ref={ref} key={key}>
          <div style={styles.label.innerDiv}>
            <a href="#" style={styles.label.minimizeButton} onClick={onMinimize}>-</a>
            <input
              style={styles.label.input}
              id={focusId}
              defaultValue={label.text}
              onChange={onTextChanged}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      );
    } else {
      throw new Error(`Unexpected mode = ${mode}`);
    }
  }

  /** React's render function */
  render() {
    const { mode } = this.props.blockProps;
    const circleRadius = this.state.circleRadius;
    return (
      <div>
        {renderIf(this.state.source)(() => (
          <div>
            <ImageWithLabels
              ref="img"
              style={styles.imgWithLabels}
              source={this.state.source}
              labels={this.props.labels}
              renderLabel={this.renderLabel}
              mode={mode}
              circleRadius={circleRadius}
              showLabels={this.state.showLabels}
              // colors
              lineHighlightColor="rgb(255,0,0)"
              lineNormalColor="rgb(0,0,0)"
              regionHighlightColor="rgba(255,255,0,0.2)"
              regionNormalColor="rgba(0,255,0,0.2)"
              stringFocusColor="rgb(255,255,0)"
              stringHighlightColor="rgb(236,150,13)"
              stringNormalColor="rgb(255,255,255)"
              // EDITION mode callbacks
              gotFocusCallback={this.onGotFocus}
              lostFocusCallback={this.onLostFocus}
              labelsChangedCallback={this.onLabelsChanged}
            />
            <div style={styles.toolbar}>
              {this.state.labelCount > 0 ?
                <div style={styles.inlineBlockme}>
                  {mode === 'EDITION' ?
                    <Dropdown
                      id="label-dropdown-custom"
                      dropup
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
                        <div>
                          <label>Circle Radius: </label>
                          <input
                            ref="circleRadiusInput"
                            type="range" min={1} max={20} step={0.2}
                            value={circleRadius}
                            onChange={this.onCircleRadiusChanged}
                          />
                          <span>{circleRadius.toFixed(2)}</span>
                        </div>
                      </Dropdown.Menu>
                    </Dropdown> : null}
                  <ToggleButton
                    turnedOnIcon="eye"
                    turnedOffIcon="eye-slash"
                    turnedOnCallback={this.showLabels}
                    turnedOffCallback={this.hideLabels}
                    iconStyle={styles.icon}
                    buttonStyle={styles.toolbarButton}
                  />
                  <Button
                    style={styles.toolbarButton}
                    onClick={() => this.refs.img.minimizeAllLabels()}
                    bsSize="small"
                  >
                    <IconStack size="2x">
                      <Icon name="circle" stack="2x" />
                      <Icon name="minus-square" stack="1x" style={styles.icon} />
                    </IconStack>
                  </Button>
                  <Button
                    style={styles.toolbarButton}
                    onClick={() => this.refs.img.maximizeAllLabels()}
                    bsSize="small"
                  >
                    <IconStack size="2x">
                      <Icon name="circle" stack="2x" />
                      <Icon name="plus-square" stack="1x" style={styles.icon} />
                    </IconStack>
                  </Button>
                </div> : null}
              {mode === 'EDITION' ?
                <input
                  style={styles.inlineBlockme} ref="fileInput" type="file" onChange={this.onFileChanged}
                /> : null}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

ImageWithLabelsWrapper.propTypes = {
  url: React.PropTypes.string,
  labels: React.PropTypes.array,
  blockProps: React.PropTypes.object.isRequired,
  circleRadius: React.PropTypes.number,
};

const styles = {
  inlineBlockme: {
    display: 'inline-block',
  },
  toolbar: {
    height: '44px',
  },
  toolbarButton: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    padding: 3,
  },
  icon: {
    color: 'white',
  },
  label: {
    innerDiv: {
      position: 'relative',
      backgroundColor: 'white',
    },
    closeButton: {
      position: 'absolute',
      top: -6,
      right: 2,
      width: 9,
      height: 7,
    },
    minimizeButton: {
      position: 'absolute',
      top: -6,
      right: 15,
      width: 12,
      height: 9,
    },
    input: {
      marginTop: 10,
      marginLeft: 1,
      marginRight: 1,
      marginBottom: 1,
    },
  },
};
