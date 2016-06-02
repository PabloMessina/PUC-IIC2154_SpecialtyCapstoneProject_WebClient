import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { DragSource } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import { Colors } from '../../../styles';

const studentSource = {
  beginDrag(props) {
    return props;
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

class Student extends Component {

  static get propTypes() {
    return {
      user: PropTypes.any.isRequired,
      identifier: PropTypes.any,
      attendance: PropTypes.any,
      highlight: PropTypes.bool,
      withoutGroup: PropTypes.bool,
      simple: PropTypes.bool,
      connectDragSource: PropTypes.func,
      isDragging: PropTypes.bool,
    };
  }

  render() {
    const { connectDragSource, simple, user, identifier, attendance, highlight, ...props } = this.props;
    const name = user ? user.name : 'Problem loading user info';

    const properties = {
      style: highlight ? style : {},
      onClick: this.onClick,
      ref: instance => connectDragSource(findDOMNode(instance)),
      ...props,
    };

    if (simple) {
      return (
        <tr {...properties}>
          <td>{name}</td>
        </tr>
      );
    } else {
      const { startedAt, finished, attended } = attendance;
      const time = startedAt ? moment(startedAt).format('dddd, MMMM Do, HH:mm') : null;

      return (
        <tr {...properties}>
          <td>{identifier}</td>
          <td>{name}</td>
          <td>{time || 'Not yet'}</td>
          <td>{finished ? 'Yes' : 'No'}</td>
          <td>{attended}</td>
        </tr>
      );
    }
  }
}

export default DragSource('student', studentSource, collect)(Student); // eslint-disable-line


const style = {
  backgroundColor: Colors.withAlpha('MAIN', 0.5),
};
