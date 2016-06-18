import React, { Component } from 'react';
import ImageWithLabels from '../image-with-labels/';
import renderIf from 'render-if';
import { Button, Dropdown } from 'react-bootstrap';
import Icon, { IconStack } from 'react-fa';
import ToggleButton from '../toggle-button/';

const defaultCircleRadius = 4;
const defaultLabels = [];

export default class ImageWithLabelsEditionWrapper extends Component {

  static get defaultProps() {
    return {
      blockProps: {
        source: { url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg' },
        metadata: {
          circleRadius: 4,
          labels: JSON.parse(`[{"regions":[{"type":"C","x":0.328,"y":0.6201923076923077,"id":0,"string":"1"},
            {"type":"C","x":0.652,"y":0.6225961538461539,"id":1,"string":"2"}],"x":0.524,"y":0.25,
            "text":"label 1","id":0},{"regions":[{"type":"P","points":[{"x":0.772,"y":0.5528846153846154},
            {"x":0.838,"y":0.7932692307692307},{"x":0.932,"y":0.6225961538461539}],"x":0.847333333333334,
            "y":0.6562500000000004,"id":2,"string":"3"},{"type":"P","points":[{"x":0.198,
            "y":0.5072115384615384},{"x":0.082,"y":0.6105769230769231},{"x":0.224,"y":0.7235576923076923}],
            "x":0.16799999999999993,"y":0.6137820512820512,"id":3,"string":"4"}],"x":0.506,
            "y":0.8701923076923077,"text":"label 2","id":1},{"regions":[{"type":"C","x":0.7708333333333334,
            "y":0.515,"id":4,"string":"5"}],"x":0.8583333333333333,"y":0.335,"text":"asdf2","id":2},
            {"regions":[{"type":"C","x":0.7125,"y":0.4425,"id":5,"string":"6"}],"x":0.7729166666666667,
            "y":0.1675,"text":"asdf3","id":3},{"regions":[{"type":"C","x":0.6333333333333333,"y":0.395,"id":6,
            "string":"7"}],"x":0.5375,"y":0.115,"text":"asdf5","id":4},{"regions":[{"type":"C",
            "x":0.47708333333333336,"y":0.435,"id":7,"string":"8"}],"x":0.29375,"y":0.1275,"text":"asdf4",
            "id":5},{"regions":[{"type":"C","x":0.4,"y":0.49,"id":8,"string":"9"}],"x":0.14583333333333334,
            "y":0.31,"text":"asdf1","id":6},{"regions":[{"type":"P","points":[{"x":0.4125,"y":0.59},
            {"x":0.33958333333333335,"y":0.6575},{"x":0.38125,"y":0.7175},{"x":0.4375,"y":0.7325},{"x":0.51875,
            "y":0.7575},{"x":0.5645833333333333,"y":0.7425},{"x":0.6166666666666667,"y":0.765},{"x":0.6125,
            "y":0.715},{"x":0.5166666666666667,"y":0.68},{"x":0.44166666666666665,"y":0.6775},
            {"x":0.3958333333333333,"y":0.6725},{"x":0.4395833333333333,"y":0.6475},{"x":0.48333333333333334,
            "y":0.595},{"x":0.5583333333333333,"y":0.64},{"x":0.5166666666666667,"y":0.5575}],
            "x":0.44856775317753167,"y":0.6299961869618695,"id":9,"string":"10"}],"x":0.5020833333333333,
            "y":0.4925,"text":"asdf0","id":7}]`),
        },
        gotFocusCallback: () => console.log('got focus'),
        lostFocusCallback: () => console.log('lost focus'),
        onMetadataChanged: () => console.log('onMetadataChanged()'),
      },
    };
  }

  constructor(props) {
    super(props);
    const { metadata } = props.blockProps;
    this.state = {
      metadata,
      showLabels: true,
    };
    this.onCircleRadiusChanged = this.onCircleRadiusChanged.bind(this);
    this.onLabelsChanged = this.onLabelsChanged.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { metadata } = nextProps.blockProps;
    this.setState({ metadata });
  }

  onCircleRadiusChanged(e) {
    console.log('=====> 2d-edition-wrapper: onCircleRadiusChanged()');
    const cr = Number(e.target.value);
    const { metadata } = this.state;
    metadata.circleRadius = cr;
    // update state and notify parent
    this.setState({ metadata }, () => this.props.blockProps.onMetadataChanged(metadata));
  }

  onLabelsChanged(labels) {
    console.log('=====> 2d-edition-wrapper: onLabelsChanged()');
    const { metadata } = this.state;
    metadata.labels = labels;
    // update state and notify parent
    this.setState({ metadata }, () => this.props.blockProps.onMetadataChanged(metadata));
  }

  renderLabel(args) {
    // edition mode args
    const { ref, key, label, style, focusId, onTextChanged,
      onKeyDown, onMinimize, onClose } = args;
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

  /** React's render function */
  render() {
    const { source } = this.props.blockProps;
    const { metadata, showLabels } = this.state;
    const circleRadius = metadata.circleRadius || defaultCircleRadius;
    const labels = metadata.labels || defaultLabels;
    const labelCount = labels ? labels.length : 0;
    const hasLabels = labelCount > 0;
    return (
      <div>
        <div>
          <ImageWithLabels
            mode="EDITION"
            ref="img"
            style={styles.imgWithLabels}
            source={source}
            labels={labels}
            circleRadius={circleRadius}
            showLabels={showLabels}
            // colors
            lineHighlightColor="rgb(255,0,0)"
            lineNormalColor="rgb(0,0,0)"
            regionHighlightColor="rgba(255,255,0,0.2)"
            regionNormalColor="rgba(0,255,0,0.2)"
            stringFocusColor="rgb(255,255,0)"
            stringHighlightColor="rgb(236,150,13)"
            stringNormalColor="rgb(255,255,255)"
            // EDITION mode props
            renderLabel={this.renderLabel}
            gotFocusCallback={this.props.blockProps.gotFocusCallback}
            lostFocusCallback={this.props.blockProps.lostFocusCallback}
            labelsChangedCallback={this.onLabelsChanged}
          />
          <div style={styles.toolbar}>
            {renderIf(hasLabels)(() => (
              <div style={styles.inlineBlockme}>
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
                </Dropdown>
                <ToggleButton
                  turnedOnIcon="eye"
                  turnedOffIcon="eye-slash"
                  turnedOnCallback={() => this.setState({ showLabels: true })}
                  turnedOffCallback={() => this.setState({ showLabels: false })}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

ImageWithLabelsEditionWrapper.propTypes = {
  blockProps: React.PropTypes.object.isRequired,
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
