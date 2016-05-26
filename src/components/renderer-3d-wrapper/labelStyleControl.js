import React, { Component } from 'react';

const fonts = [
  'Georgia', 'serif', 'Times New Roman', 'Arial', 'Helvetica', 'sans-serif',
];

export default class LabelStyleControl extends Component {

  constructor(props) {
    super(props);
    this.state = { labelStyle: props.labelStyle };
    this.onLabelStyleChanged = this.onLabelStyleChanged.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ labelStyle: nextProps.labelStyle });
  }

  onLabelStyleChanged() {
    const labelStyle = {
      font: this.refs.fontSelect.value,
      fontSize: Number(this.refs.fontSizeInput.value),
      foregroundColor: this.refs.foregroundColorInput.value,
      backgroundColor: this.refs.backgroundColorInput.value,
      //borderColor: this.refs.borderColorInput.value,
      //lineColor: this.refs.lineColorInput.value,
      //sphereColor: this.refs.sphereColorInput.value,
      borderThickness: Number(this.refs.borderThicknessSlider.value),
      //cornerRadiusCoef: Number(this.refs.cornerRadiusCoefSlider.value),
      worldFontSizeCoef: Number(this.refs.worldFontSizeCoefSlider.value),
    };
    this.props.labelStyleChangedCallback(labelStyle);
    this.setState({ labelStyle: { ...this.state.labelStyle, ...labelStyle } });
  }

  render() {
    const labelStyle = this.state.labelStyle;
    const font = labelStyle.font;
    const fontSize = labelStyle.fontSize;
    const foregroundColor = labelStyle.foregroundColor;
    const backgroundColor = labelStyle.backgroundColor;
    const borderColor = labelStyle.borderColor;
    const lineColor = labelStyle.lineColor;
    const sphereColor = labelStyle.sphereColor;
    const borderThickness = labelStyle.borderThickness;
    const cornerRadiusCoef = labelStyle.cornerRadiusCoef;
    const worldFontSizeCoef = labelStyle.worldFontSizeCoef;

    return (
      <div>
        <label>Font: <select ref="fontSelect" value={font} onChange={this.onLabelStyleChanged}>
          {fonts.map(f => <option key={f}>{f}</option>)}
        </select>
        </label>
        <br />
        <label>ForegroundColor: <input ref="foregroundColorInput" type="color"
          value={foregroundColor} onChange={this.onLabelStyleChanged}
        />
        </label>
        <br />
        <label>BackgroundColor: <input ref="backgroundColorInput" type="color"
          value={backgroundColor} onChange={this.onLabelStyleChanged}
        />
        </label>
        <br />
        <label>BorderColor: <input ref="borderColorInput" type="color"
          value={borderColor} onChange={this.onLabelStyleChanged}
        />
        </label>
        <br />
        {/*<label>LineColor: <input ref="lineColorInput" type="color"
          value={lineColor} onChange={this.onLabelStyleChanged}
        />
        </label>
        <br />*/}
        {/*<label>SphereColor: <input ref="sphereColorInput" type="color"
          value={sphereColor} onChange={this.onLabelStyleChanged}
        />
        </label>
        <br />*/}
        <label>FontSize: </label>
        <input ref="fontSizeInput"
          type="range" min={25} max={100} step={2}
          value={fontSize} onChange={this.onLabelStyleChanged}
        />
        <span>{fontSize}</span>
        <br />
        <label>BorderThickness: </label>
        <input ref="borderThicknessSlider"
          type="range" min={2} max={80} step={4}
          value={borderThickness} onChange={this.onLabelStyleChanged}
        />
        <span>{borderThickness}</span>
        <br />
        {/*<label>CornerRadiusCoeficient: </label>
        <input ref="cornerRadiusCoefSlider"
          type="range" min={0.05} max={0.5} step={0.025}
          value={cornerRadiusCoef} onChange={this.onLabelStyleChanged}
        />
        <span>{cornerRadiusCoef}</span>
        <br />*/}
        <label>WorldFontSizeCoeficient: </label>
        <input ref="worldFontSizeCoefSlider"
          type="range" min={0.005} max={0.16} step={0.0005}
          value={worldFontSizeCoef} onChange={this.onLabelStyleChanged}
        />
        <span>{worldFontSizeCoef}</span>
      </div>
    );
  }
}

LabelStyleControl.propTypes = {
  labelStyle: React.PropTypes.object.isRequired,
  labelStyleChangedCallback: React.PropTypes.func.isRequired,
};
