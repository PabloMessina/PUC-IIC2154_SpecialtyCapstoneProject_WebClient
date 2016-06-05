/**
 * Shared drag-and-drop code
 */

import { Colors } from '../../../styles';

export default {

  target: {
    drop(props, monitor) {
      if (monitor.isOver()) {   // do nothing if student was dropped over a team
        const { user, attendance, withoutGroup } = monitor.getItem();
        if (withoutGroup) {
          if (props.updateOrCreateAttendance) { // TODO: this is unnecessary if "canDrop" is implemented
            props.updateOrCreateAttendance(user || attendance.user || attendance.userId);
          }
        } else {
          props.removeFromGroup(attendance);
        }
      }
    },
  },

  collect(connect, monitor) {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver({ shallow: true }),
      isUnselected() {
        const { withoutGroup } = monitor.getItem();
        return withoutGroup;
      },
    };
  },

  styles: {
    addingColor: Colors.withAlpha('MAIN', 0.5),
    removingColor: Colors.withAlpha('RED', 0.5),
  },

};
