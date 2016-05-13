import React, { Component } from 'react';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class TemplateComponent extends Component {

  static get defaultProps() {
    return {
      remoteUrl: 'https://lopezjuri.com/videos/M_10___Default1.jpg',
      maxWidth: 500,
      maxHeight: 400,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      array: ['zero', 'one', 'two'],
      something: true,
    };

    // ES6 bindings
    // See: https://facebook.github.io/react/docs/reusable-components.html#es6-classes
    // See: https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md#es6-classes
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ something: !this.state.something });
  }

  componentDidMount() {
    // if a remote image url was provided, try load it
    if (this.props.remoteUrl) {
      const canvas = this.refs.canvas;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        let ratio = 1;
        if (img.width > this.props.maxWidth) {
          ratio = this.props.maxWidth / img.width;
        }
        if (img.height > this.props.maxHeight) {
          ratio = Math.min(this.props.maxWidth / img.width, ratio);
        }
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
      };
      img.src = this.props.remoteUrl;
    }
  }

  render() {
    return (
      <div>
        <input ref="fileInput" type="file" onChange={this.onFileChanged}></input>
        <canvas ref="canvas" style={styles.canvas}>
        </canvas>
      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
TemplateComponent.propTypes = {
  remoteUrl: React.PropTypes.string,
  maxWidth: React.PropTypes.number,
  maxHeight: React.PropTypes.number,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  canvas: {
    width: '400px',
    height: '400px',
  },
};
