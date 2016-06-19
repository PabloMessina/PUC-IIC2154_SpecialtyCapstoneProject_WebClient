/* eslint react/sort-comp:0 */

import React, { PropTypes, Component } from 'react';
import { Col } from 'react-bootstrap';

import Element from './element';

export default class ElementsColumn extends Component {
  static get propTypes() {
    return {
      columnNumber: PropTypes.number.isRequired,
      elements: PropTypes.array.isRequired,
      extraRowSpace: PropTypes.number,
      globalDragging: PropTypes.bool,
      cursorClick: PropTypes.bool,
      canEdit: PropTypes.bool,
      canRespond: PropTypes.bool,
      onHeights: PropTypes.func,
      onClickFunc: PropTypes.func,
      onMouseEnter: PropTypes.func,
      onMouseLeave: PropTypes.func,
      onEdit: PropTypes.func,
      onDelete: PropTypes.func,
      endElementLink: PropTypes.func,
      updateElements: PropTypes.bool,

      md: PropTypes.number.isRequired,
      sm: PropTypes.number.isRequired,
      xs: PropTypes.number.isRequired,
    };
  }

  constructor(props) {
    super(props);

    this.heights = [];
    this.receivedHeights = 0;

    this.onHeightComputed = this.onHeightComputed.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.updateElements;
  }

  onHeightComputed(index, height) {
    const { columnNumber, elements, onHeights } = this.props;

    this.receivedHeights++;
    this.heights[index] = height;

    if (this.receivedHeights === elements.length) {
      onHeights(columnNumber, this.heights);
    }
  }

  render() {
    const {
      elements,
      columnNumber,
      extraRowSpace,
      globalDragging,
      cursorClick,
      canEdit,
      canRespond,
      onClickFunc,
      onMouseEnter,
      onMouseLeave,
      onEdit,
      onDelete,
      endElementLink,
      md,
      sm,
      xs,
    } = this.props;

    const canDelete = elements.length > 2;

    return (
      <Col
        style={styles.column(columnNumber)}
        md={md} sm={sm} xs={xs}
      >
        {elements.map((element, i) =>
          <Element
            key={i}
            index={i}
            text={element}
            columnNumber={columnNumber}
            onHeightComputed={height => this.onHeightComputed(i, height)}
            extraRowSpace={extraRowSpace}
            last={i === elements.length - 1}
            globalDragging={globalDragging}
            cursorClick={cursorClick}
            canEdit={canEdit}
            canDelete={canDelete}
            canRespond={canRespond}
            onClickFunc={onClickFunc}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onEdit={onEdit}
            onDelete={onDelete}
            endElementLink={endElementLink}
          />
        )}
      </Col>
    );
  }
}

const styles = {
  column(columnNumber) {
    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: columnNumber === 0 ? 'flex-end' : 'flex-start',
    };
  },
};
