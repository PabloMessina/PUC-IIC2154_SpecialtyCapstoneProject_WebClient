import React, { Component } from 'react';
import ImageWithLabels from '../image-with-labels/';
import renderIf from 'render-if';
import {
  Panel,
  ListGroup,
  ListGroupItem,
  Col,
  Row,
  Grid,
} from 'react-bootstrap';

export default class ImageWithLabelsReadOnlyWrapper extends Component {

  static get defaultProps() {
    return {
      source: { url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg' },
      circleRadius: 9,
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
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedLabelIds: [],
      labels: [0, 1, 2, 3, 4, 5, 6],
    };
    this.renderLabel = this.renderLabel.bind(this);
    this.showOrHideLabel = this.showOrHideLabel.bind(this);
  }

  componentDidMount() {
  }

  showOrHideLabel(i) {
    const labels = this.state.labels;
    console.log(labels);
    const index = labels.indexOf(i);
    console.log(labels);
    if (index > -1) {
      labels.splice(index, 1);
    }
    console.log(labels);
    this.setState({ labels });
  }

  renderLabel(element, i) {
    return (
      <ListGroupItem key={i} onClick={() => this.showOrHideLabel(element.id)}>
        {element.text}
      </ListGroupItem>
    );
  }

  /** React's render function */
  render() {
    const labels = this.state.labels;
    return (<div>
      {renderIf(this.props.source)(() => (
        <Panel>
          <Grid>
            <Row>
              <Col md={3}>
                <ListGroup style={styles.list}>
                  {this.props.labels.map((element, i) => this.renderLabel(element, i))}
                </ListGroup>
              </Col>
              <Col md={9}>
                <ImageWithLabels
                  mode="READONLY"
                  ref="img"
                  source={this.props.source}
                  labels={this.props.labels}
                  circleRadius={this.props.circleRadius}
                  // colors
                  lineHighlightColor="rgb(255,0,0)"
                  regionHighlightColor="rgba(255,255,0,0.2)"
                  stringHighlightColor="rgb(236,150,13)"
                  // READONLY mode props
                  showRegionStrings
                  fillRegions
                  selectedLabelIds={[0, 1, 2]}
                />
              </Col>
            </Row>
          </Grid>
        </Panel>
      ))}
    </div>);
  }
}

ImageWithLabelsReadOnlyWrapper.propTypes = {
  source: React.PropTypes.object.isRequired,
  labels: React.PropTypes.array.isRequired,
  circleRadius: React.PropTypes.number.isRequired,
};

const styles = {
  list: {
    height: 300,
    overflowY: 'scroll',
  },
};
