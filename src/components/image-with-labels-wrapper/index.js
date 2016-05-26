import React, { Component } from 'react';
import ImageWithLabels from '../image-with-labels/';
import renderIf from 'render-if';
import Utils2D from '../../_2Dlibrary/Utils2D';

export default class ImageWithLabelsWrapper extends Component {

  static get defaultProps() {
    return {
      url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg',
      gotFocusCallback: () => console.log('img2D::gotFocus()'),
      lostFocusCallback: () => console.log('img2D::lostFocus()'),
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      source: props.url ? { url: props.url } : null,
    };
    this.mystate = {
      componentFocused: false,
    };
    this.onFileChanged = this.onFileChanged.bind(this);
    this.onGotFocus = this.onGotFocus.bind(this);
    this.onLostFocus = this.onLostFocus.bind(this);
  }

  onFileChanged() {
    const file = this.refs.fileInput.files[0];
    if (file) this.setState({ source: { file } });
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

  onGotFocus() {
    this.props.gotFocusCallback();
  }
  onLostFocus() {
    this.props.lostFocusCallback();
  }

  /** React's render function */
  render() {
    return (
      <div>
        <input ref="fileInput" type="file" onChange={this.onFileChanged}></input>
        {renderIf(this.state.source)(() => (
          <div >
            <ImageWithLabels
              ref="img"
              style={styles.imgWithLabels}
              source={this.state.source}
              renderLabel={this.renderLabel}
              mode="EDIT"
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
  gotFocusCallback: React.PropTypes.func,
  lostFocusCallback: React.PropTypes.func,
};

const styles = {
  imgWithLabels: {
    marginLeft: 100,
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
