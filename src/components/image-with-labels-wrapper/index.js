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
        readOnly: false,
        gotFocusCallback: () => {},
        lostFocusCallback: () => {},
      },
      circleRadius: 4,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      source: props.url ? { url: props.url } : null,
      circleRadius: props.circleRadius,
      showLabels: true,
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
    this.setState({ labelCount: labels.length });
  }

  showLabels() {
    this.setState({ showLabels: true });
  }

  hideLabels() {
    this.setState({ showLabels: false });
  }

  renderLabel({ label, focusId, ref, key, style, isReadOnly,
    onTextChanged, onKeyDown, onMinimize, onClose }) {
    if (isReadOnly) {
      return (<input
        ref={ref}
        key={key}
        style={{ ...styles.input, ...style }}
        defaultValue={label.text}
        readOnly
      />);
    } else {
      // console.log("renderLabel(): label.text = ", label.text);
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
    }
  }

  /** React's render function */
  render() {
    const { readOnly } = this.props.blockProps;
    const circleRadius = this.state.circleRadius;
    return (
      <div>
        <input ref="fileInput" type="file" onChange={this.onFileChanged}></input>
        {renderIf(this.state.source)(() => (
          <div style={styles.toolbarWrapper}>
            <div style={styles.toolbar}>
              <Dropdown
                id="label-dropdown-custom"
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
              </Dropdown>
              {this.state.labelCount > 0 ?
                <ToggleButton
                  turnedOnIcon="eye"
                  turnedOffIcon="eye-slash"
                  turnedOnCallback={this.showLabels}
                  turnedOffCallback={this.hideLabels}
                  iconStyle={styles.icon}
                  buttonStyle={styles.toolbarButton}
                /> : null}
              {this.state.labelCount > 0 ?
                <Button
                  style={styles.toolbarButton}
                  onClick={() => this.refs.img.minimizeAllLabels()}
                  bsSize="small"
                >
                  <IconStack size="2x">
                    <Icon name="circle" stack="2x" />
                    <Icon name="minus-square" stack="1x" style={styles.icon} />
                  </IconStack>
                </Button> : null}
              {this.state.labelCount > 0 ?
                <Button
                  style={styles.toolbarButton}
                  onClick={() => this.refs.img.maximizeAllLabels()}
                  bsSize="small"
                >
                  <IconStack size="2x">
                    <Icon name="circle" stack="2x" />
                    <Icon name="plus-square" stack="1x" style={styles.icon} />
                  </IconStack>
                </Button> : null}
            </div>
            <ImageWithLabels
              ref="img"
              style={styles.imgWithLabels}
              source={this.state.source}
              renderLabel={this.renderLabel}
              mode={readOnly ? 'READONLY' : 'EDITION'}
              circleRadius={circleRadius}
              gotFocusCallback={this.onGotFocus}
              lostFocusCallback={this.onLostFocus}
              labelsChangedCallback={this.onLabelsChanged}
              showLabels={this.state.showLabels}
            />
          </div>
        ))}
      </div>
    );
  }
}

ImageWithLabelsWrapper.propTypes = {
  url: React.PropTypes.string,
  blockProps: React.PropTypes.object.isRequired,
  circleRadius: React.PropTypes.number,
};

const styles = {
  toolbarWrapper: {
    position: 'relative',
  },
  toolbar: {
    position: 'absolute',
    left: '0%',
    top: '100%',
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
