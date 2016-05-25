import React, { PropTypes, Component } from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { Colors } from '../../../styles';

import { DragSource } from 'react-dnd';
import { findDOMNode } from 'react-dom';


const studentSource = {
  beginDrag(props) {
    const { student, withoutGroup } = props;
    const user = student.user || student;   // prop "student" can be an attendance or a user
    return { user, withoutGroup };
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
      student: PropTypes.any.isRequired,
      highlight: PropTypes.bool,
      withoutGroup: PropTypes.bool,

      connectDragSource: PropTypes.func.isRequired,
      isDragging: PropTypes.bool.isRequired,
    };
  }

  render() {
    const { connectDragSource, student, highlight } = this.props;
    const user = student.user || student;   // prop "student" can be an attendance or a user

    return (
      <ListGroupItem
        style={highlight ? style : {}}
        onClick={this.onClick}
        ref={instance => connectDragSource(findDOMNode(instance))}
      >
        {user ? user.name : 'Loading...'}
      </ListGroupItem>
    );
  }
}

export default DragSource('student', studentSource, collect)(Student); // eslint-disable-line


const style = {
  backgroundColor: Colors.withAlpha('MAIN', 0.5),
};
