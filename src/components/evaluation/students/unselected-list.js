import React, { PropTypes, Component } from 'react';
import { Panel, Table } from 'react-bootstrap';
import { Colors } from '../../../styles';

import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

import Student from './student';
import StudentRemoveTarget from './student-remove-target.js';

class UnselectedList extends Component {
  static get propTypes() {
    return {
      unselected: PropTypes.array.isRequired,
      removeFromGroup: PropTypes.func.isRequired,

      connectDropTarget: PropTypes.func.isRequired,
      isOver: PropTypes.bool.isRequired,
      isUnselected: PropTypes.func.isRequired,
    };
  }

  render() {
    const { connectDropTarget, isOver, isUnselected, unselected } = this.props;
    const style = {};
    if (isOver && !isUnselected()) {
      style.backgroundColor = StudentRemoveTarget.styles.removingColor;
    }

    return (
      <Panel
        style={style}
        ref={instance => connectDropTarget(findDOMNode(instance))}
      >
        <h4> Unselected Students </h4>
        {unselected.length > 0 ?
          <p>Pick unselected students from this list.</p>
        :
          <p style={styles.grayText}>All students are assigned to groups.</p>
        }
        <Table hover>
          <tbody>
            {unselected.map(user =>
              <Student
                key={user.id}
                user={user}
                simple
                withoutGroup
              />
            )}
          </tbody>
        </Table>
      </Panel>
    );
  }

}

export default DropTarget('student', StudentRemoveTarget.target, StudentRemoveTarget.collect)(UnselectedList);  // eslint-disable-line


const styles = {
  grayText: {
    color: Colors.GRAY,
  },
};
