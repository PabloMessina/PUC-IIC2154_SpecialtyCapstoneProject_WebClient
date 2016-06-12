/* eslint react/sort-comp:0 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Col, Row, Panel, Button, Alert } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';
import _ from 'lodash';

import compose, { QuestionPropTypes } from '../question';
import Canvas from './canvas';
import ElementsColumn from './elements-column';
import Coordinates from './coordinates';


class Correlation extends Component {

  static get propTypes() {
    return QuestionPropTypes;
  }

  static get defaultProps() {
    return {
      fields: {
        columns: [
          ['element 1', 'element 2'],
          ['element A', 'element B'],
        ],
      },
      answer: {
        choices: [],
      },
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      extraRowSpace: [],
      dragging: null,
      refresh: true,
      height: 0,
      showInstructions: !localStorage.hideCorrelationInstructions,
      showCantDelete: false,
    };

    this.coordinates = new Coordinates(bootstrapCSS.rowMarginBottom);
    this.updateElements = true;
    this.resetHeights();
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);

    const { mode, question, onAnswerChange, onFieldsAndAnswerChange, fields, answer } = this.props;
    if (mode === 'editor' && (!question.answer || !question.fields)) {
      onFieldsAndAnswerChange(fields, answer);
    } else if (mode === 'responder' && !question.answer) {
      onAnswerChange({ choices: [] });
    } else {
      this.forceUpdate();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.fields, nextProps.fields)) {
      this.handleResize();
    }
  }

  resetHeights = () => {
    this.heightCols = [{}, {}];
    this.totalHeightsReceived = 0;
  }

  handleResize = () => {
    this.resetHeights();
    this.setState({ refresh: true });
  }

  componentDidUpdate() {
    if (this.state.refresh) {
      // eslint-disable-next-line
      this.setState({ refresh: false });  // AAARGH, "Do not use setState in componentDidUpdate"
      return;
    }
    if (!this.correlationDomNode) {
      this.correlationDomNode = ReactDOM.findDOMNode(this);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    this.updateElements = _.isEqual(this.state.dragging, nextState.dragging);
  }

  onElementClick = (sourceColumn, sourceIndex) => {
    const { dragging } = this.state;
    if (dragging) {
      const { targetIndex } = dragging;
      if (targetIndex !== null) {
        const col0 = sourceColumn === 0 ? sourceIndex : dragging.sourceIndex;
        const col1 = sourceColumn === 1 ? sourceIndex : dragging.sourceIndex;
        this.linkElements([col0, col1]);
      }

      this.endElementLink();
    } else {
      this.setState({
        dragging: {
          sourceColumn,
          sourceIndex,
          targetIndex: null,
          onMouseMove: this.onMouseMove,
        },
      });
    }
  }

  endElementLink = () => {
    this.setState({ dragging: null });
  }

  onMouseMove = (e) => {
    this.setState({
      dragging: {
        ...this.state.dragging,
        x: e.pageX,
        y: e.pageY,
      },
    });
  }

  onElementMouseEnter = (column, index) => {
    const { dragging } = this.state;
    this.setDraggingIndexIf(dragging && dragging.sourceColumn !== column, index);
  }

  onElementMouseLeave = () => {
    const { dragging } = this.state;
    this.setDraggingIndexIf(dragging, null);
  }

  setDraggingIndexIf = (condition, index) => {
    if (condition) {
      this.setState({
        dragging: {
          ...this.state.dragging,
          targetIndex: index,
        },
      });
    }
  }


  linkElements = (newChoice) => {
    const { answer, onAnswerChange } = this.props;
    const choices = [...answer.choices];
    const index = choices.findIndex(choice => _.isEqual(choice, newChoice));
    if (index === -1) {
      // add answer
      choices.push(newChoice);
    } else {
      // delete answer
      choices.splice(index, 1);
    }

    onAnswerChange({ choices });
  }


  onEdit = (columnNumber, index, name) => {
    const { fields, onFieldsChange } = this.props;
    const columns = _.cloneDeep(fields.columns);
    columns[columnNumber][index] = name;

    onFieldsChange({ columns });
  }

  onDelete = (deletingColNum, deletingIndex) => {
    if (deletingColNum === null) {
      this.setState({ showCantDelete: true });
      return;
    }

    const { answer, fields, onFieldsAndAnswerChange } = this.props;

    const columns = _.cloneDeep(fields.columns);
    columns[deletingColNum].splice(deletingIndex, 1);

    const choices = [];
    answer.choices.forEach(c => {
      if (c[deletingColNum] === deletingIndex) {
        // choice from/to removed field, don't include
        return;
      }
      if (c[deletingColNum] > deletingIndex) {
        // choice to a deletingIndex higher than the deleted
        const c2 = [...c];
        c2[deletingColNum]--;
        choices.push(c2);
      } else {
        // no change
        choices.push(c);
      }
    });

    onFieldsAndAnswerChange({ columns }, { choices });
  }

  onAddElementClick = (columnNumber) => {
    const newName = undefined;
    const { fields, onFieldsChange } = this.props;
    const columns = _.cloneDeep(fields.columns);
    columns[columnNumber].push(newName);
    onFieldsChange({ columns });
  }

  onHeights = (columnNumber, heights) => {
    const heightCol = this.heightCols[columnNumber];
    heightCol.first = heights[0];
    heightCol.last = heights[heights.length - 1];
    heightCol.others = heights.slice(1, heights.length - 1);
    this.totalHeightsReceived++;

    if (this.totalHeightsReceived === 2) {
      const { extraRowSpace, elementCenters, height } =
        this.coordinates.onAllHeights(this.heightCols);
      this.setState({ extraRowSpace, elementCenters, height });
    }
  }

  dismissInstructions = () => {
    this.setState({ showInstructions: false });
    // TODO: this should be saved in the user database
    localStorage.hideCorrelationInstructions = true;
  }

  renderElementsColumn = (i) => {
    const { fields, mode } = this.props;
    const { extraRowSpace, dragging } = this.state;
    const { columns } = fields;
    const { md, sm, xs } = gridElementsColumns;
    const cursorClick = dragging && dragging.sourceColumn !== i;
    const isDragging = !!dragging;
    const canEdit = mode === 'editor';
    const canRespond = mode !== 'reader';

    return (
      <ElementsColumn
        columnNumber={i}
        elements={columns[i]}
        extraRowSpace={extraRowSpace[i]}
        cursorClick={cursorClick}
        canEdit={canEdit}
        canRespond={canRespond}
        globalDragging={isDragging}
        onHeights={this.onHeights}
        onClickFunc={this.onElementClick}
        onMouseEnter={this.onElementMouseEnter}
        onMouseLeave={this.onElementMouseLeave}
        onEdit={this.onEdit}
        onDelete={this.onDelete}
        endElementLink={this.endElementLink}
        updateElements={this.updateElements}
        md={md} sm={sm} xs={xs}
      />
    );
  }

  renderAddElementButton = (i) => {
    const { md, sm, xs } = gridElementsColumns;
    const pull = i === 0 ? 'pull-right' : 'pull-left';

    return (
      <Col md={md} sm={sm} xs={xs}>
        <Row>
          <Button
            bsSize="small"
            className={pull}
            onClick={() => this.onAddElementClick(i)}
          >
            <Icon name="plus" />
            <span> Add element</span>
          </Button>
        </Row>
      </Col>
    );
  }

  /**
   * There are two columns with elements. The first time they are rendered we don't know their height,
   * so when the element component did mount, it tells its height to its parent.
   * When this component has the heights of all the elements, it renders everything again
   * with the correct positions and total height.
   */
  render() {
    const { fields, answer, mode } = this.props;
    const columns = fields ? fields.columns : null;

    if (!columns || columns.length === 0) {
      return (
        <Panel>
          Loading...
        </Panel>
      );
    }
    if (columns.length !== 2 || columns[0].length < 2 || columns[1].length < 2) {
      throw new Error('Invalid column in correlation question!', columns);
    }

    const { elementCenters, height, dragging, refresh, showInstructions, showCantDelete } = this.state;
    if (refresh) {
      // kill child components
      return (
        <div style={{ height }} />
      );
    }

    const choices = answer ? answer.choices : [];

    const { md, sm, xs } = gridElementsColumns;
    const mdCanvas = 12 - 2 * md;
    const smCanvas = 12 - 2 * sm;
    const xsCanvas = 12 - 2 * xs;

    const onMouseMove = dragging ? dragging.onMouseMove : null;
    const cursor = dragging ? 'cursorGrabbing' : '';

    const canEdit = mode === 'editor';

    return (
      <div>
        {/* A relative div to wrap */}
        <div
          className={cursor}
          style={styles.relativeDiv}
          onMouseMove={onMouseMove}
          onClick={this.endElementLink}
        >
          {/* A canvas over the div */}
          <Canvas
            choices={choices}
            elementCenters={elementCenters}
            dragging={dragging}
            height={height}
            correlationDomNode={this.correlationDomNode}
            colRef={this.colRef}
          />
          {/* A div with three columns, under the canvas */}
          <div style={styles.columnsDiv}>
            {this.renderElementsColumn(0)}
            <Col
              ref={ref => { this.colRef = ref; }}
              md={mdCanvas} sm={smCanvas} xs={xsCanvas}
            />
            {this.renderElementsColumn(1)}
          </div>
          {/* A div with fixed height, to fill the question modal */}
          <div style={{ height }} />
        </div>

        {renderIf(canEdit)(
          <div>
            <Row style={styles.buttonsRow}>
              {this.renderAddElementButton(0)}
              <Col md={mdCanvas} sm={smCanvas} xs={xsCanvas} />
              {this.renderAddElementButton(1)}
            </Row>

            {renderIf(showCantDelete)(
              <Alert
                bsStyle="warning"
                onDismiss={() => this.setState({ showCantDelete: false })}
              >
                <p>A column can't have less than two elements.</p>
              </Alert>
            )}

            {renderIf(showInstructions)(
              <Alert
                bsStyle="info"
                style={{ backgroundColor: '#aaa' /* "info" is purple! TODO: change theme */}}
                onDismiss={this.dismissInstructions}
              >
                <p>Double click an element to edit. Leave the field blank to delete.</p>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }

}
export default compose(Correlation);


const gridElementsColumns = {
  md: 3,
  sm: 4,
  xs: 4,
};

// Should match bootstrap's CSS
const bootstrapCSS = {
  rowMarginBottom: 23,
};

const styles = {
  relativeDiv: {
    position: 'relative',
  },
  columnsDiv: {
    width: '100%',
    position: 'absolute',
  },
  buttonsRow: {
    marginTop: bootstrapCSS.rowMarginBottom,
    marginBottom: bootstrapCSS.rowMarginBottom,
  },
};
