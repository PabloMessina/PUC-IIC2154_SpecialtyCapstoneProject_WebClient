import React, { PropTypes, Component } from 'react';

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
      identifier: PropTypes.any.isRequired,
      updateOrCreateAttendance: PropTypes.func,
      strip: PropTypes.bool,
      connectDropTarget: PropTypes.func.isRequired,
      isOverAnotherGroup: PropTypes.func.isRequired,
    };
  }

  render() {
    const { identifier, connectDropTarget, isOverAnotherGroup, team, strip } = this.props;

    return (
      <tbody ref={instance => connectDropTarget(findDOMNode(instance))}>
        {team.users.map(({ user, ...attendance }, i) =>
          <Student
            className={strip ? 'active' : undefined}
            key={i}
            identifier={identifier}
            attendance={attendance}
            user={user}
            highlight={isOverAnotherGroup(team)}
          />
        )}
      </tbody>
    );
  }
}

export default DropTarget('student', teamTarget, collect)(Team);  // eslint-disable-line
