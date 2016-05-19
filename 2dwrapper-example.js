import React, { PropTypes, Component } from 'react';
import Pablo from '../pablo';

class Wrapper extends Component {

  static get propTypes() {
    return {
      style: PropTypes.object,
    };
  }


  constructor(props) {
    super(props);
    this.state = {
      labels: [{
        id: '1',
        text: '',
        hidden: false,
        x: 0.0,
        y: 0.0,
        areas: [{
          type: 'Polygon',
          coordinates: [
            [0.1, 0.2],
            [0.4, 0.5],
          ],
        }],
      }, {
        id: '2',
        text: 'Lorem',
        hidden: true,
        x: 0.0,
        y: 0.0,
        areas: [{
          type: 'Ellipse',
          coordinates: [0.2, 0.4]
          radius: 2,
        }],
      }],
    };
  }

  onCreateLabel(label) {
    const labels = [...this.props.label, label];
    this.setState({ labels });
  }

  onAnswerChange(e, label) {

  }

  renderLabel(label, style) {
    return (
      <input style={{ ...styles.input, ...style }} onChange={e => this.onAnswerChange(e, label)}>{label.text}</input>
    );
  }

  render() {
    const { height, width, ...style } = this.props.style;
    const mode = 'editor' // 'read', 'respond'

    return (
      <div style={{ ...styles.container, ...style }}>
        <Pablo
          style={styles.main}git c
          source={{ uri: 'http://...' }} {/* { file: File } */}
          labels={this.state.labels}
          mode={mode}
          renderLabel={this.renderLabel}
          hideLabels={false}
          onCreateLabel={this.onCreateLabel}
          onPointSelection={}
          onLabelSelection={}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    margin: 10,
  },
  input: {

  },
  main: {
    height: 100,
    width: 200,
  },
};
