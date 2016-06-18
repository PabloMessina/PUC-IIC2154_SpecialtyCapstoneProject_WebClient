import React, { Component } from 'react';
import renderIf from 'render-if';
import isEqual from 'lodash/isEqual';

const fonts = [
  'Georgia', 'serif', 'Times New Roman', 'Arial', 'Helvetica', 'sans-serif',
];

export default class LabelStyleControl extends Component {

  static get defaultProps() {
    return { showAllOptions: false };
  }

  constructor(props) {
    super(props);
    this.state = { labelStyle: props.labelStyle };
    this.onBackgroundColorChanged = this.onBackgroundColorChanged.bind(this);
    this.onBorderColorChanged = this.onBorderColorChanged.bind(this);
    this.onBorderThicknessChanged = this.onBorderThicknessChanged.bind(this);
    this.onCornerRadiusCoefChanged = this.onCornerRadiusCoefChanged.bind(this);
    this.onFontChanged = this.onFontChanged.bind(this);
    this.onFontSizeChanged = this.onFontSizeChanged.bind(this);
    this.onForegroundColorChanged = this.onForegroundColorChanged.bind(this);
    this.onLineColorChanged = this.onLineColorChanged.bind(this);
    this.onSphereColorChanged = this.onSphereColorChanged.bind(this);
    this.onWorldFontSizeCoefChanged = this.onWorldFontSizeCoefChanged.bind(this);
    this.updateLabelStyle = this.updateLabelStyle.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.labelStyle, nextProps.labelStyle)) {
      this.setState({ labelStyle: nextProps.labelStyle });
    }
  }

  onBackgroundColorChanged(e) {
    this.updateLabelStyle('backgroundColor', e.target.value);
  }
  onBorderColorChanged(e) {
    this.updateLabelStyle('borderColor', e.target.value);
  }
  onBorderThicknessChanged(e) {
    this.updateLabelStyle('borderThickness', Number(e.target.value));
  }
  onCornerRadiusCoefChanged(e) {
    this.updateLabelStyle('cornerRadiusCoef', Number(e.target.value));
  }
  onFontChanged(e) {
    this.updateLabelStyle('font', e.target.value);
  }
  onFontSizeChanged(e) {
    this.updateLabelStyle('fontSize', Number(e.target.value));
  }
  onForegroundColorChanged(e) {
    this.updateLabelStyle('foregroundColor', e.target.value);
  }
  onLineColorChanged(e) {
    this.updateLabelStyle('lineColor', e.target.value);
  }
  onSphereColorChanged(e) {
    this.updateLabelStyle('sphereColor', e.target.value);
  }
  onWorldFontSizeCoefChanged(e) {
    this.updateLabelStyle('worldFontSizeCoef', Number(e.target.value));
  }
  updateLabelStyle(attribute, value) {
    const labelStyle = this.state.labelStyle;
    labelStyle[attribute] = value;
    this.setState({ labelStyle });
    this.props.labelStyleChangedCallback(labelStyle);
  }

  render() {
    const {
      font,
      fontSize,
      foregroundColor,
      backgroundColor,
      borderColor,
      lineColor,
      sphereColor,
      borderThickness,
      cornerRadiusCoef,
      worldFontSizeCoef,
    } = this.state.labelStyle;

    return (
      <div id="labelstylecontrol-root" style={styles.root}>
        <label>ForegroundColor: <input
          ref="foregroundColorInput" type="color"
          value={foregroundColor} onChange={this.onForegroundColorChanged}
        />
        </label>
        <br />
        <label>BackgroundColor: <input
          ref="backgroundColorInput" type="color"
          value={backgroundColor} onChange={this.onBackgroundColorChanged}
        />
        </label>
        <br />
        <label>WorldFontSizeCoeficient: </label><br />
        <input
          ref="worldFontSizeCoefSlider"
          type="range" min={0.005} max={0.16} step={0.0005}
          value={worldFontSizeCoef} onChange={this.onWorldFontSizeCoefChanged}
          style={styles.rangeInput}
        />
        <span>{worldFontSizeCoef.toFixed(2)}</span>
        {renderIf(this.props.showAllOptions)(() => (<div>
          <label>FontSize: </label><br />
          <input
            ref="fontSizeInput"
            type="range" min={25} max={100} step={2}
            value={fontSize} onChange={this.onFontSizeChanged}
            style={styles.rangeInput}
          />
          <span>{fontSize.toFixed(2)}</span>
          <br />
          <label>BorderColor: <input
            ref="borderColorInput" type="color"
            value={borderColor} onChange={this.onBorderColorChanged}
          />
          </label>
          <br />
          <label>Font: <select ref="fontSelect" value={font} onChange={this.onFontChanged}>
            {fonts.map(f => <option key={f}>{f}</option>)}
          </select>
          </label>
          <br />
          <label>LineColor: <input
            ref="lineColorInput" type="color"
            value={lineColor} onChange={this.onLineColorChanged}
          />
          </label>
          <br />
          <label>SphereColor: <input
            ref="sphereColorInput" type="color"
            value={sphereColor} onChange={this.onSphereColorChanged}
          />
          </label>
          <br />
          <label>BorderThickness: </label>
          <input
            ref="borderThicknessSlider"
            type="range" min={2} max={80} step={4}
            value={borderThickness} onChange={this.onBorderThicknessChanged}
            style={styles.rangeInput}
          />
          <span>{borderThickness.toFixed(2)}</span>
          <br />
          <label>CornerRadiusCoeficient: </label><br />
          <input
            ref="cornerRadiusCoefSlider"
            type="range" min={0.05} max={0.5} step={0.025}
            value={cornerRadiusCoef} onChange={this.onCornerRadiusCoefChanged}
            style={styles.rangeInput}
          />
          <span>{cornerRadiusCoef.toFixed(2)}</span>
          <br />
        </div>))}
        {/* style to make the scrollbar always visible */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              `#labelstylecontrol-root::-webkit-scrollbar {
                -webkit-appearance: none;
                width: 7px;
              }
              #labelstylecontrol-root::-webkit-scrollbar-thumb {
                border-radius: 4px;
                background-color: rgba(0,0,0,.5);
                -webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);
                border-radius: 4px;
              }`,
          }}
        >
        </style>
      </div>
    );
  }
}

LabelStyleControl.propTypes = {
  labelStyle: React.PropTypes.object.isRequired,
  labelStyleChangedCallback: React.PropTypes.func.isRequired,
  showAllOptions: React.PropTypes.bool,
};

const styles = {
  root: {
    height: '165px',
    overflow: 'scroll',
    backgroundColor: 'rgb(247, 242, 234)',
    padding: '13px',
  },
  rangeInput: {
    width: '140px',
    display: 'inline',
    marginRight: '10px',
  },
};
