import React, { Component } from 'react';
import { Checkbox, Col, Table, Button, Glyphicon, Form, FormControl } from 'react-bootstrap';

// TODO: incluir alumnos en asistencia

export default class Students extends Component {

  constructor(props) {
    super(props);
    this.state = {
      /**
       * @type {Number}
       * To which group unselectedStudents will be added.
       */
      selectedGroup: 0,
      /**
       * @type {Number}
       * Value of groupSize input
       */
      groupSize: 3,
      attendance: [],
    };

    // TODO: todavia existen?
    this.renderGroup = this.renderGroup.bind(this);
    this.addGroup = this.addGroup.bind(this);
    this.isButtonDisabled = this.isButtonDisabled.bind(this);
    this.rowGroupStyle = this.rowGroupStyle.bind(this);
    this.randomGroupGenerator = this.randomGroupGenerator.bind(this);

    this.unassignedStudents = this.unassignedStudents.bind(this);
  }

  unassignedStudents() {
    const unassignedStudents = [];
    this.props.users.forEach(user => {
      unassignedStudents.push(user.id);
    });
    this.props.evaluation.groups.forEach(group => {
      group.forEach(studentId => {
        unassignedStudents.splice(unassignedStudents.indexOf(studentId), 1);
      });
    });
    unassignedStudents.sort();
    return unassignedStudents;
  }

  addToGroup(studentId) {
    const groups = [...this.props.evaluation.groups];
    groups[this.state.selectedGroup].push(studentId);
    this.props.onEvaluationChange({ groups });
  }

  removeFromGroup(groupIndex, studentIndex) {
    let groups = [...this.props.evaluation.groups];
    groups[groupIndex].splice(studentIndex, 1);

    let selectedGroup = this.state.selectedGroup;
    // delete empty group
    if (groups[groupIndex].length === 0) {
      groups.splice(groupIndex, 1);
      if (selectedGroup >= groupIndex) {
        selectedGroup--;
      }
      if (groups.length === 0) {
        groups = [[]];
        selectedGroup = 0;
      }
    }

    this.setState({ selectedGroup });
    this.props.onEvaluationChange({ groups });
  }

  addGroup() {
    const groups = [...this.props.evaluation.groups];
    groups.push([]);
    this.props.onEvaluationChange({ groups });
    this.setState({ selectedGroup: groups.length - 1 });
  }

  rowGroupStyle(groupIndex) {
    const style = {};
    // stripe
    if (groupIndex % 2 === 0) {
      style.backgroundColor = '#f9f9f9';
    }
    // selected
    if (this.state.selectedGroup === groupIndex) {
      style.borderLeft = 'solid 7px #2CA083';
    }
    return style;
  }

  isButtonDisabled() {
    const arr = this.props.evaluation.groups;
    return arr[arr.length - 1].length === 0;
  }
//FIXME
  includeInAttendance(studentId) {
    const attendance = [...this.state.attendance];
    attendance.push(studentId);
    return attendance;
  }
//FIXME
  removeFromAttendance(studentId) {
    const attendance = [...this.state.attendance];
    attendance.splice(attendance.indexOf(studentId), 1);
    return attendance;
  }
//FIXME
  handleCheckboxChange(checked, studentId) {
    if (checked) {
      const attendance = this.includeInAttendance(studentId);
      this.setState({ attendance });
    //  console.log(attendance);
    } else {
      const attendance = this.removeFromAttendance(studentId);
      this.setState({ attendance });
    //  console.log(attendance);
    }
  }

  // http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle(constArray) {
    const array = [...constArray];
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  randomGroupGenerator(groupSize) {
    if (groupSize < 1 || groupSize > 99 || groupSize % 1 !== 0) {
      alert('Invalid group size. Groups must be integer numbers between 1 and 99');
    } else {
      const unassignedIds = [];
      this.props.users.forEach(user => {
        unassignedIds.push(user.id);
      });
      const unselectedStudents = this.shuffle(unassignedIds);
      console.log(unselectedStudents[0]);
      const groups = [];
      while (unselectedStudents.length > 0) {
        const group = unselectedStudents.splice(0, groupSize);
        if (group.length < groupSize) {
          // alumnos restantes se reparten en los otros grupos
          group.forEach((student, index) => {
            groups[index % groupSize].push(student);
          });
        } else {
          groups.push(group);
        }
      }
      this.props.onEvaluationChange({ groups });
    }
  }

  renderGroupIndex(groupIndex, studentIndex, groupLength) {
    if (studentIndex === 0) {
      return (
        <td
          rowSpan={groupLength}
          onClick={() => this.setState({ selectedGroup: groupIndex })}
        >
          {groupIndex + 1}
        </td>
      );
    }
    return null;
  }
  // FIXME
  renderGroup(group, groupIndex) {
    if (group.length > 0) {
      return (
        group.map((studentId, studentIndex) => (
          <tr key={studentId} style={this.rowGroupStyle(groupIndex)}>
            {this.renderGroupIndex(groupIndex, studentIndex, group.length)}
            <td onClick={() => this.removeFromGroup(groupIndex, studentIndex)} >
              {this.props.users.find(user => {
                return user.id === studentId;
              }).name}
            </td>
            <td>
              <Checkbox
                style={styles.checkbox}
                onChange={(e) => this.handleCheckboxChange(e.target.checked, studentId)}
              />
            </td>
          </tr>
        ))
      );
    }
    // empty group
    return (
      <tr style={this.rowGroupStyle(groupIndex)}>
        {this.renderGroupIndex(groupIndex, 0, 1)}
        <td />
        <td />
      </tr>
    );
  }

  render() {
    return (
      <div>
        <div>
          <Form inline>
            <span>Generate random groups of </span>
            <FormControl
              type="number"
              min="1"
              max="99"
              onkeypress="return event.charCode >= 48 && event.charCode <= 57"
              placeholder="3"
              style={styles.groupSizeInput}
              onChange={e => { this.setState({ groupSize: e.target.value }); }}
            />
            <span> people </span>
            <Button
              style={styles.generateGroupsButton}
              onClick={() => this.randomGroupGenerator(this.state.groupSize)}
            >
              Generate
            </Button>
          </Form>
          <br />
        </div>
        <div>
          <Col md={8}>
            <Table bordered condensed hover>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Name</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
              {this.props.evaluation.groups.map(this.renderGroup)}
              </tbody>
            </Table>
            <Button onClick={this.addGroup} disabled={this.isButtonDisabled()}>
              <Glyphicon glyph="plus" />
              <span> New Group</span>
            </Button>
          </Col>
          <Col md={4}>
            <Table striped bordered condensed hover>
              <thead>
                <tr>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
              {this.unassignedStudents().map((studentId, i) => (
                <tr key={i}>
                  <td onClick={() => this.addToGroup(studentId)}>
                    {this.props.users.find(student => {
                      return student.id === studentId;
                    }).name}
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
          </Col>
        </div>
      </div>
    );
  }
}

Students.propTypes = {
  children: React.PropTypes.any,
  users: React.PropTypes.array,
  students: React.PropTypes.array,
  evaluation: React.PropTypes.object,
  onEvaluationChange: React.PropTypes.func,
};

const styles = {
  checkbox: {
    margin: 'auto',
  },
  groupSizeInput: {
    width: '80px',
    marginLeft: '10px',
    marginRight: '10px',
  },
  generateGroupsButton: {
    marginLeft: '20px',
  },
};
