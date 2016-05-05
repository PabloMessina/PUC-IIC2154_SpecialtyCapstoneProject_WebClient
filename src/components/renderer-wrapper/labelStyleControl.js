import React, { Component } from 'react';

const fonts = [
  'Georgia', 'serif', 'Times New Roman', 'Arial', 'Helvetica', 'sans-serif',
];

export default class LabelStyleControl extends Component {

  constructor(props) {
    super(props);
    this.onLabelStyleChanged = this.onLabelStyleChanged.bind(this);
  }

  onLabelStyleChanged() {
    this.props.labelStyleChangedCallback({
      font: this.refs.fontSelect.value,
      fontSize: Number(this.refs.fontSizeInput.value),
      foregroundColor: this.refs.foregroundColorInput.value,
      backgroundColor: this.refs.backgroundColorInput.value,
      borderColor: this.refs.borderColorInput.value,
      borderThickness: Number(this.refs.borderThicknessInput.value),
      worldFontSizeCoef: Number(this.refs.worldFontSizeCoefSlider.value),
    });
  }

  render() {
    const labelStyle = this.props.initialLabelStyle;
    const font = labelStyle.font;
    const fontSize = labelStyle.fontSize;
    const foregroundColor = labelStyle.foregroundColor;
    const backgroundColor = labelStyle.backgroundColor;
    const borderColor = labelStyle.borderColor;
    const borderThickness = labelStyle.borderThickness;
    const worldFontSizeCoef = labelStyle.worldFontSizeCoef;

    return (
      <div>
        <label>Font: <select ref="fontSelect" value={font} onChange={this.onLabelStyleChanged}>
          {fonts.map(f => <option>{f}</option>)}
          </select>
        </label>
        <br />
        <label>ForegroundColor: <input ref="foregroundColorInput" type="color"
          value={foregroundColor} onChange={this.onLabelStyleChanged} />
        </label>
        <br />
        <label>BackgroundColor: <input ref="backgroundColorInput" type="color"
          value={backgroundColor} onChange={this.onLabelStyleChanged} />
        </label>
        <br />
        <label>BorderColor: <input ref="borderColorInput" type="color"
          value={borderColor} onChange={this.onLabelStyleChanged} />
        </label>
        <br />
        <label>FontSize: </label>
        <input ref="fontSizeInput"
          type="range" min={20} max={90} step={2}
          value={fontSize} onChange={this.onLabelStyleChanged} />
          <span>{fontSize}</span>
        <br />
        <label>BorderThickness: </label>
        <input ref="borderThicknessInput"
          type="range" min={2} max={80} step={4}
          value={borderThickness} onChange={this.onLabelStyleChanged} />
          <span>{borderThickness}</span>
        <br />
        <label>WorldFontSizeCoeficient: </label>
        <input ref="worldFontSizeCoefSlider"
          type="range" min={0.005} max={0.1} step={0.0005}
          value={worldFontSizeCoef} onChange={this.onLabelStyleChanged} />
          <span>{worldFontSizeCoef}</span>
      </div>
    );
  }
}

LabelStyleControl.propTypes = {
  initialLabelStyle: React.PropTypes.object.isRequired,
  labelStyleChangedCallback: React.PropTypes.func.isRequired,
};
