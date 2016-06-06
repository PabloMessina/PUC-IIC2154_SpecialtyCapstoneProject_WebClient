import React, { Component } from 'react';
import ImageWithLabels from '../image-with-labels/';
import renderIf from 'render-if';
import { Button, Dropdown } from 'react-bootstrap';
import Icon, { IconStack } from 'react-fa';

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
    };
    this.mystate = {
      componentFocused: false,
    };
    this.onFileChanged = this.onFileChanged.bind(this);
    this.onGotFocus = this.onGotFocus.bind(this);
    this.onLostFocus = this.onLostFocus.bind(this);
    this.onCircleRadiusChanged = this.onCircleRadiusChanged.bind(this);
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
      console.log("renderLabel(): label.text = ", label.text);
      return (
        <div style={style} ref={ref} key={key}>
          <div style={styles.label.innerDiv}>
            <a href="#" style={styles.label.minimizeButton} onClick={onMinimize}>-</a>
            <a href="#" style={styles.label.closeButton} onClick={onClose}>x</a>
            <input
              style={styles.label.input}
              id={focusId}
              defaultValue={label.text}
              onChange={(e) => onTextChanged(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
      );
    }
  }

  onCircleRadiusChanged(e) {
    this.setState({ circleRadius: Number(e.target.value) });
  }

  /** React's render function */
  render() {
    const { readOnly } = this.props.blockProps;
    const circleRadius = this.state.circleRadius;
    return (
      <div>
        <div style={styles.toolbar}>
          <Dropdown
            id="label-dropdown-custom"
            /*
            open={this.state.labelDropdownOpen}
            onToggle={this.onLabelDropDownToggle}
            ref="labelDropdown"
            dropup
            pullRight*/
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
                <label>Circle Radius Coef: </label>
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
        </div>
        <input ref="fileInput" type="file" onChange={this.onFileChanged}></input>
        {renderIf(this.state.source)(() => (
          <div >
            <ImageWithLabels
              ref="img"
              style={styles.imgWithLabels}
              source={this.state.source}
              renderLabel={this.renderLabel}
              mode={readOnly ? 'READONLY' : 'EDITION'}
              circleRadius={circleRadius}
              gotFocusCallback={this.onGotFocus}
              lostFocusCallback={this.onLostFocus}
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
  imgWithLabels: {
    marginLeft: 100,
  },
  label: {
    toolbar: {
      position: 'absolute',
      left: '0%',
      bottom: '100%',
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
