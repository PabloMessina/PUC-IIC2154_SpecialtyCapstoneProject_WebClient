/* eslint react/sort-comp:0 */

import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';

import { Colors } from '../../../styles';

export default class Canvas extends Component {
  static get propTypes() {
    return {
      choices: PropTypes.array.isRequired,
      elementCenters: PropTypes.array,
      dragging: PropTypes.object,
      height: PropTypes.number,
      correlationDomNode: PropTypes.object,
      colRef: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {};

    this.drawDraggingLine = this.drawDraggingLine.bind(this);
    this.drawChoices = this.drawChoices.bind(this);
    this.getDeletingChoice = this.getDeletingChoice.bind(this);
  }

  componentDidUpdate() {
    const { dragging, correlationDomNode } = this.props;
    const canvas = this.canvasRef;

    if (!canvas || !correlationDomNode) return;
    if (!this.coordinatesSet) this.setCoordinates();

    const { ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.deletingChoice = this.getDeletingChoice();

    this.drawChoices();
    if (dragging) this.drawDraggingLine();
  }


  setCoordinates() {
    const bezierOffsetMult = 0.5;
    const labelSeparation = 10;

    const { correlationDomNode, colRef } = this.props;
    const canvas = this.canvasRef;

    const colDomNode = ReactDOM.findDOMNode(colRef);
    const linesLeft = colDomNode.offsetLeft;
    const linesWidth = colDomNode.offsetWidth;
    this.xLeft = linesLeft + labelSeparation;
    this.xLeftB = this.xLeft + linesWidth * bezierOffsetMult;
    this.xRight = this.xLeft + linesWidth - 2 * labelSeparation;
    this.xRightB = this.xRight - linesWidth * bezierOffsetMult;

    canvas.width = correlationDomNode.offsetWidth;
    this.ctx = canvas.getContext('2d');
    this.coordinatesSet = true;
  }

  getDeletingChoice() {
    const { choices, dragging } = this.props;
    if (dragging) {
      const { sourceColumn, sourceIndex, targetIndex } = dragging;
      return choices.findIndex(choice =>
        choice[sourceColumn] === sourceIndex &&
        choice[1 - sourceColumn] === targetIndex);
    }
    return -1;
  }

  drawDraggingLine() {
    const { elementCenters, dragging, correlationDomNode } = this.props;
    const { ctx, xLeft, xLeftB, xRight, xRightB } = this;

    const { sourceColumn, sourceIndex, targetIndex } = dragging;
    const x1 = sourceColumn === 0 ? xLeft : xRight;
    const y1 = elementCenters[sourceColumn][sourceIndex];

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.save();

    if (!dragging.x) {
      // draw default initial line
      ctx.strokeStyle = Colors.GRAY;
      const x2 = x1 + 5;
      const y2 = y1;
      ctx.lineTo(x2, y2);
    } else if (targetIndex !== null) {
      // mouse is over an element
      const x2 = sourceColumn === 0 ? xRight : xLeft;
      const y2 = elementCenters[1 - sourceColumn][targetIndex];

      if (this.deletingChoice !== -1) {
        // delete this line
        ctx.strokeStyle = Colors.RED;
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);

        const x1B = sourceColumn === 0 ? xLeftB : xRightB;
        const x2B = sourceColumn === 0 ? xRightB : xLeftB;
        ctx.bezierCurveTo(x1B, y1, x2B, y2, x2, y2);
      } else {
        // link this elements
        ctx.strokeStyle = Colors.MAIN;
        ctx.lineWidth = 2;
        ctx.lineTo(x2, y2);
      }
    } else {
      // draw line to mouse
      ctx.strokeStyle = Colors.GRAY;

      // screen relative coordinates
      const rect = correlationDomNode.getBoundingClientRect();
      const tx = rect.left + window.scrollX;
      const ty = rect.top + window.scrollY;
      ctx.translate(-tx, -ty);
      ctx.lineTo(dragging.x, dragging.y);
    }

    ctx.stroke();
    ctx.restore();
  }

  drawChoices() {
    const { choices, elementCenters } = this.props;
    const { ctx, xLeft, xLeftB, xRight, xRightB } = this;

    choices.forEach((choice, index) => {
      if (index === this.deletingChoice) return;  // don't draw under deleting line
      const y1 = elementCenters[0][choice[0]];
      const y2 = elementCenters[1][choice[1]];
      ctx.beginPath();
      ctx.moveTo(xLeft, y1);
      ctx.bezierCurveTo(xLeftB, y1, xRightB, y2, xRight, y2);
      ctx.stroke();
    });
  }

  render() {
    const { height } = this.props;

    return (
      <canvas
        ref={ref => { this.canvasRef = ref; }}
        style={styles.canvas}
        height={height}
      >
        thy stone age brows'r doest not supp'rt canvas!
      </canvas>
    );
  }
}

const styles = {
  canvas: {
    position: 'absolute',
  },
};
