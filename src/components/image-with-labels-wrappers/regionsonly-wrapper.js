import React, { Component } from 'react';
import ImageWithLabels from '../image-with-labels/';
import renderIf from 'render-if';
import ToggleButton from '../toggle-button/';

export default class ImageWithLabelsRegionsOnlyWrapper extends Component {

  static get defaultProps() {
    return {
      source: { url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg' },
      labels: JSON.parse(`[{"regions":[{"type":"C","x":0.328,"y":0.6201923076923077,
        "id":0,"string":"1"},{"type":"C","x":0.652,"y":0.6225961538461539,"id":1,"string":"2"}]
        ,"x":0.524,"y":0.25,"text":"label 1","id":0},{"regions":[{"type":"P","points":[{"x":0.772,
        "y":0.5528846153846154},{"x":0.838,"y":0.7932692307692307},{"x":0.932,"y":0.6225961538461539}],
        "x":0.847333333333334,"y":0.6562500000000004,"id":2,"string":"3"},{"type":"P","points":[{"x":
        0.198,"y":0.5072115384615384},{"x":0.082,"y":0.6105769230769231},{"x":0.224,"y":0.7235576923076923}],
        "x":0.16799999999999993,"y":0.6137820512820512,"id":3,"string":"4"}],"x":0.506,
        "y":0.8701923076923077,"text":"label 2","id":1}]`),
      circleRadius: 4,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      showLabels: true,
    };
    this.showLabels = this.showLabels.bind(this);
    this.hideLabels = this.hideLabels.bind(this);
  }

  showLabels() {
    this.setState({ showLabels: true });
  }

  hideLabels() {
    this.setState({ showLabels: false });
  }

  /** React's render function */
  render() {
    return (
      <div>
        {renderIf(this.props.source)(() => (
          <div>
            <ImageWithLabels
              mode="REGIONSONLY"
              ref="img"
              source={this.props.source}
              labels={this.props.labels}
              circleRadius={this.props.circleRadius}
              showLabels={this.state.showLabels}
              // colors
              lineHighlightColor="rgb(255,0,0)"
              lineNormalColor="rgb(0,0,0)"
              regionHighlightColor="rgba(255,255,0,0.2)"
              regionNormalColor="rgba(0,255,0,0.2)"
              stringFocusColor="rgb(255,255,0)"
              stringHighlightColor="rgb(236,150,13)"
              stringNormalColor="rgb(255,255,255)"
              // REGIONSONLY mode props
              showRegionStrings
            />
            <div style={styles.toolbar}>
              {renderIf(this.state.labelCount > 0)(() => (
                <div style={styles.inlineBlockme}>
                  <ToggleButton
                    turnedOnIcon="eye"
                    turnedOffIcon="eye-slash"
                    turnedOnCallback={this.showLabels}
                    turnedOffCallback={this.hideLabels}
                    iconStyle={styles.icon}
                    buttonStyle={styles.toolbarButton}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

ImageWithLabelsRegionsOnlyWrapper.propTypes = {
  source: React.PropTypes.object.isRequired,
  labels: React.PropTypes.array.isRequired,
  circleRadius: React.PropTypes.number.isRequired,
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
};
