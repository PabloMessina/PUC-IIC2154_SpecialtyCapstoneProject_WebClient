/* eslint react/sort-comp:0 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Col, Row, Panel, Button, Glyphicon } from 'react-bootstrap';
import renderIf from 'render-if';
import _ from 'lodash';

import compose, { QuestionPropTypes } from '../question';
import Canvas from './canvas';
import ElementsColumn from './elements-column';


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
      extraSpace: [],
      dragging: null,
      refresh: true,
      height: 0,
    };

    this.onHeights = this.onHeights.bind(this);
    this.makeElementsLined = this.makeElementsLined.bind(this);
    this.onElementClick = this.onElementClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onElementMouseEnter = this.onElementMouseEnter.bind(this);
    this.onElementMouseLeave = this.onElementMouseLeave.bind(this);
    this.endElementLink = this.endElementLink.bind(this);
    this.setDraggingIndexIf = this.setDraggingIndexIf.bind(this);
    this.linkElements = this.linkElements.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onAddElementClick = this.onAddElementClick.bind(this);
    this.renderElementsColumn = this.renderElementsColumn.bind(this);
    this.renderAddElementButton = this.renderAddElementButton.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.resetHeights = this.resetHeights.bind(this);

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

  resetHeights() {
    this.heightCols = [{}, {}];
    this.totalHeightsReceived = 0;
  }

  handleResize() {
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

  onElementClick(sourceColumn, sourceIndex) {
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

  endElementLink() {
    this.setState({ dragging: null });
  }

  onMouseMove(e) {
    this.setState({
      dragging: {
        ...this.state.dragging,
        x: e.pageX,
        y: e.pageY,
      },
    });
  }

  onElementMouseEnter(column, index) {
    const { dragging } = this.state;
    this.setDraggingIndexIf(dragging && dragging.sourceColumn !== column, index);
  }

  onElementMouseLeave() {
    const { dragging } = this.state;
    this.setDraggingIndexIf(dragging, null);
  }

  setDraggingIndexIf(condition, index) {
    if (condition) {
      this.setState({
        dragging: {
          ...this.state.dragging,
          targetIndex: index,
        },
      });
    }
  }


  linkElements(newChoice) {
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


  onEdit(columnNumber, index, name) {
    const { fields, onFieldsChange } = this.props;
    const columns = _.cloneDeep(fields.columns);
    columns[columnNumber][index] = name;

    onFieldsChange({ columns });
  }

  onDelete(deletingColNum, deletingIndex) {
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

  onAddElementClick(columnNumber) {
    const newName = undefined;
    const { fields, onFieldsChange } = this.props;
    const columns = _.cloneDeep(fields.columns);
    columns[columnNumber].push(newName);
    onFieldsChange({ columns });
  }


  onHeights(columnNumber, heights) {
    const heightCol = this.heightCols[columnNumber];
    heightCol.first = heights[0];
    heightCol.originalFirst = heights[0];
    heightCol.last = heights[heights.length - 1];
    heightCol.originalLast = heights[heights.length - 1];
    heightCol.others = heights.slice(1, heights.length - 1);
    this.totalHeightsReceived++;

    if (this.totalHeightsReceived === 2) {
      const { columns } = this.props.fields;
      let extraSpace = [{}, {}];

      extraSpace = this.makeElementsLined(extraSpace, 'first', 'top');
      extraSpace = this.makeElementsLined(extraSpace, 'last', 'bottom');
      this.heightCols[0].total = this.totalHeight(this.heightCols[0]);
      this.heightCols[1].total = this.totalHeight(this.heightCols[1]);

      const { indexSmall, indexLarge } = this.getIndexes(this.heightCols, 'total');
      extraSpace[indexLarge].row = 0;
      const remainingSpace = this.heightCols[indexLarge].total - this.heightCols[indexSmall].total;
      extraSpace[indexSmall].row = remainingSpace / (columns[indexSmall].length - 1);

      const elementCenters = this.calculateElementCenters(this.heightCols, extraSpace);
      const height =
        Math.max(this.heightCols[0].total, this.heightCols[1].total) +
        bootstrapCSS.rowMarginBottom;

      this.setState({ extraSpace, elementCenters, height });
    }
  }

  totalHeight(heightCol) {
    return heightCol.originalFirst +
      heightCol.others.reduce((a, b) => a + b, 0) +
      bootstrapCSS.rowMarginBottom * ((heightCol.others.length - 1) + 2) +
      heightCol.originalLast;
  }

  /**
   * Gets { indexSmall, indexLarge } according to which this.heightCols."property" is larger
   */
  getIndexes(heightCols, property) {
    if (heightCols[0][property] > heightCols[1][property]) {
      return {
        indexSmall: 1,
        indexLarge: 0,
      };
    } else {
      return {
        indexSmall: 0,
        indexLarge: 1,
      };
    }
  }

  makeElementsLined(extraSpaceOriginal, element, cssMargin) {
    const extraSpace = [...extraSpaceOriginal];
    const { indexSmall, indexLarge } = this.getIndexes(element);
    extraSpace[indexLarge][cssMargin] = 0;
    const add = (this.heightCols[indexLarge][element] - this.heightCols[indexSmall][element]) / 2;
    extraSpace[indexSmall][cssMargin] = Math.max(0, add);
    this.heightCols[indexSmall][element] += add;
    return extraSpace;
  }

  calculateElementCenters(heightCols, extraSpace) {
    const elementCenters = [];
    for (let i = 0; i < 2; i++) {
      const centers = [];
      const { originalFirst, others, originalLast } = heightCols[i];
      const { top, row } = extraSpace[i];

      centers.push(top + originalFirst / 2);
      let offset = top + originalFirst + bootstrapCSS.rowMarginBottom + row;

      const remaining = [...others, originalLast];
      remaining.forEach(h => {
        centers.push(offset + h / 2);
        offset += h + bootstrapCSS.rowMarginBottom + row;
      });

      elementCenters.push(centers);
    }
    return elementCenters;
  }

  renderElementsColumn(i) {
    const { fields, mode } = this.props;
    const { extraSpace, dragging } = this.state;
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
        extraSpace={extraSpace[i]}
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

  renderAddElementButton(i) {
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
            <Glyphicon glyph="plus" />
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

    if (this.state.refresh) {
      // kill child components
      return (
        <div style={styles.fillerDiv(height)} />
      );
    }

    const choices = answer ? answer.choices : [];
    const { elementCenters, height, dragging } = this.state;

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
          <div style={styles.fillerDiv(height)} />
        </div>

        {renderIf(canEdit)(
          <div style={styles.buttonsDiv}>
            {this.renderAddElementButton(0)}
            <Col md={mdCanvas} sm={smCanvas} xs={xsCanvas} />
            {this.renderAddElementButton(1)}
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

// Should match bootstraps CSS
const bootstrapCSS = {
  rowMarginBottom: 23,
  columnPaddingTotal: 15 * 2,
};

const styles = {
  relativeDiv: {
    position: 'relative',
  },
  columnsDiv: {
    width: '100%',
    position: 'absolute',
  },
  fillerDiv(height) {
    return { height: `${height}px` };
  },
  buttonsDiv: {
    marginTop: `${bootstrapCSS.rowMarginBottom}px`,
  },
};