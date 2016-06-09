import React, { PropTypes, Component } from 'react';
import { Panel, Table } from 'react-bootstrap';

import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import Team from './team';
import StudentRemoveTarget from './student-remove-target.js';

class TeamList extends Component {
  static get propTypes() {
    return {
      teams: PropTypes.array.isRequired,
      evaluation: PropTypes.object.isRequired,
      removeFromGroup: PropTypes.func.isRequired,
      updateOrCreateAttendance: PropTypes.func.isRequired,

      connectDropTarget: PropTypes.func.isRequired,
      isOver: PropTypes.bool.isRequired,
      isUnselected: PropTypes.func.isRequired,
    };
  }

  render() {
    const { connectDropTarget, isOver, isUnselected, teams, evaluation } = this.props;
    const style = { ...styles.panel };
    if (isOver) {
      if (isUnselected()) {
        style.backgroundColor = StudentRemoveTarget.styles.addingColor;
      } else {
        style.backgroundColor = StudentRemoveTarget.styles.removingColor;
      }
    }

    return (
      <Panel
        style={style}
        ref={instance => connectDropTarget(findDOMNode(instance))}
      >
        <h4> Selected Students </h4>
        <hr />
        <Table hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Started at</th>
              <th>Finished</th>
              <th>Attendance</th>
            </tr>
          </thead>
          {teams.map((team, i) =>      // TODO: sort???   random team id => random order
            <Team
              key={i}
              strip={i % 2 === 0}
              identifier={i + 1}
              team={team}
              evaluation={evaluation}
              updateOrCreateAttendance={this.props.updateOrCreateAttendance}
            />
          )}
        </Table>
      </Panel>
    );
  }
}

export default DropTarget('student', StudentRemoveTarget.target, StudentRemoveTarget.collect)(TeamList);  // eslint-disable-line

const styles = {
  panel: {
    paddingLeft: '30px',
    paddingRight: '30px',
  },
};
