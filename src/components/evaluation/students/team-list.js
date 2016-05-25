import React, { PropTypes, Component } from 'react';
import { Panel } from 'react-bootstrap';

import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import Team from './team';
import StudentRemoveTarget from './student-remove-target.js';

class TeamList extends Component {
  static get propTypes() {
    return {
      teams: PropTypes.any.isRequired,
      removeFromGroup: PropTypes.func.isRequired,
      updateOrCreateAttendance: PropTypes.func.isRequired,

      connectDropTarget: PropTypes.func.isRequired,
      isOver: PropTypes.bool.isRequired,
      isUnselected: PropTypes.func.isRequired,
    };
  }

  render() {
    const { connectDropTarget, isOver, isUnselected, teams } = this.props;
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
        {teams.length > 0 ?
          teams.map((team, i) =>      // TODO: sort???   random team id => random order
            <Team
              key={i}
              team={team}
              updateOrCreateAttendance={this.props.updateOrCreateAttendance}
            />
          )
        :
          <p>There are no groups yet. Drag a student here to create one.</p>
        }
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
