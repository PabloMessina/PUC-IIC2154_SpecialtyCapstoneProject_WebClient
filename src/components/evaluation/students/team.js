import React, { PropTypes, Component } from 'react';
import { ListGroup } from 'react-bootstrap';

import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import Student from './student';


const teamTarget = {
  drop(props, monitor) {
    const { user } = monitor.getItem();
    props.updateOrCreateAttendance(user.id, props.team.id);
  },
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),

    /**
     * Like "isOver", but returns false if it's over it's current team
     */
    isOverAnotherGroup(team) {
      if (!monitor.isOver()) {
        return false;
      }
      const { user } = monitor.getItem();
      return !team.users.some(attendance => attendance.userId === user.id);
    },
  };
}


class Team extends Component {

  static get propTypes() {
    return {
      team: PropTypes.object.isRequired,
      updateOrCreateAttendance: PropTypes.func,

      connectDropTarget: PropTypes.func.isRequired,
      isOverAnotherGroup: PropTypes.func.isRequired,
    };
  }

  render() {
    const { connectDropTarget, isOverAnotherGroup, team } = this.props;

    return (
      <ListGroup
        ref={instance => connectDropTarget(findDOMNode(instance))}
      >
        {team.users.map((student, i) =>
          <Student
            key={i}
            student={student}
            highlight={isOverAnotherGroup(team)}
          />
        )}
      </ListGroup>
    );
  }
}

export default DropTarget('student', teamTarget, collect)(Team);  // eslint-disable-line
