/* eslint no-nested-ternary: 0 */

import React, { PropTypes, Component } from 'react';
import { ButtonToolbar, Button, ButtonGroup } from 'react-bootstrap';
import moment from 'moment';
import { DragSource } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import app from '../../../app';
const attendanceService = app.service('/attendances');

import { Colors } from '../../../styles';

const translateAttendance = (value) => {
  switch (value) {
    case -1: return 'Absent';
    case 1: return 'Attended';
    default: return 'Unknown';
  }
};

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
      user: PropTypes.any,
      identifier: PropTypes.any,
      attendance: PropTypes.any,
      highlight: PropTypes.bool,
      withoutGroup: PropTypes.bool,
      simple: PropTypes.bool,
      connectDragSource: PropTypes.func,
      isDragging: PropTypes.bool,
      evaluation: PropTypes.object,
    };
  }

  onAttendanceChange(value) {
    const { attendance } = this.props;
    // Reset to 'Unknown' if it's selected twice
    const attended = attendance.attended !== value ? value : 0;
    return attendanceService.patch(attendance.id, { attended });
  }

  render() {
    const { connectDragSource, simple, user, identifier, evaluation, attendance, highlight, ...props } = this.props;
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
      const now = moment();
      const duration = evaluation.duration;
      // // When the evaluation finish
      const finishAt = moment(evaluation.finishAt);
      // // When the user started
      const startedAt = moment(attendance.startedAt);
      // // The user deadline
      const finishedAt = startedAt.isValid() ? moment.min(finishAt, startedAt.clone().add(duration, 'ms')) : finishAt;

      const { attended } = attendance;
      const time = startedAt.isValid() ? moment(startedAt).format('dddd, MMMM Do, HH:mm') : null;
      const isOver = now.isAfter(finishedAt);

      const getStyle = (value) => {
        const active = attended === value;
        return {
          active,
          bsStyle: active ? (value === 1 ? 'primary' : 'danger') : 'default',
        };
      };

      return (
        <tr {...properties}>
          <td>{identifier}</td>
          <td>{name}</td>
          <td>{time || 'Not yet'}</td>
          <td>{isOver ? 'Yes' : 'No'}</td>
          <td>
            <ButtonToolbar>
              <ButtonGroup bsSize="xsmall">
                {[-1, 1].map((value, i) =>
                  <Button key={i} {...getStyle(value)} onClick={() => this.onAttendanceChange(value)}>
                    {translateAttendance(value)}
                  </Button>
                )}
              </ButtonGroup>
            </ButtonToolbar>
          </td>
        </tr>
      );
    }
  }
}

export default DragSource('student', studentSource, collect)(Student); // eslint-disable-line


const style = {
  backgroundColor: Colors.withAlpha('MAIN', 0.5),
};
