import React, { Component } from 'react';
import { Checkbox, Row, Col, Table, Button, Glyphicon, Form, FormControl, Panel } from 'react-bootstrap';

// TODO: incluir alumnos en asistencia

export default class Students extends Component {

  static get propTypes() {
    return {
      users: React.PropTypes.array,
      groups: React.PropTypes.array,
      students: React.PropTypes.array,
      attendants: React.PropTypes.array,
      evaluation: React.PropTypes.object,
      onGroupsChange: React.PropTypes.func,
      onAttendantsChange: React.PropTypes.func,
    };
  }

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
    };

    // TODO: todavia existen?
    this.renderGroup = this.renderGroup.bind(this);
    this.addGroup = this.addGroup.bind(this);
    this.isNewGroupButtonDisabled = this.isNewGroupButtonDisabled.bind(this);
    this.randomGroupGenerator = this.randomGroupGenerator.bind(this);
    this.unassignedStudents = this.unassignedStudents.bind(this);
  }

   /**
    * Sensible default: every evaluation will be answered by a single student
    */
  componentWillMount() {
    this.randomGroupGenerator(1);
  }

  /**
   * Students not assigned to any group
   * @return {array} Array with ids
   */
  unassignedStudents() {
    const unassignedStudents = [];
    this.props.users.forEach(user => {
      unassignedStudents.push(user.id);
    });
    this.props.groups.forEach(group => {
      group.forEach(studentId => {
        unassignedStudents.splice(unassignedStudents.indexOf(studentId), 1);
      });
    });
    unassignedStudents.sort();
    return unassignedStudents;
  }

  addToGroup(studentId) {
    const groups = [...this.props.groups];
    groups[this.state.selectedGroup].push(studentId);
    this.props.onGroupsChange(groups);
  }

  removeFromGroup(groupIndex, studentIndex) {
    let groups = [...this.props.groups];
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
    this.props.onGroupsChange(groups);
  }

  addGroup() {
    const groups = [...this.props.groups];
    groups.push([]);
    this.props.onGroupsChange(groups);
    this.setState({ selectedGroup: groups.length - 1 });
  }

  /**
   * Cannot create a new group if there is already an empty one
   * @return {Boolean}
   */
  isNewGroupButtonDisabled() {
    const arr = this.props.groups;
    return arr[arr.length - 1].length === 0;
  }

  includeInAttendance(studentId) {
    const attendance = [...this.props.attendants];
    attendance.push(studentId);
    return attendance;
  }

  removeFromAttendance(studentId) {
    const attendance = [...this.props.attendants];
    attendance.splice(attendance.indexOf(studentId), 1);
    return attendance;
  }

  handleCheckboxChange(checked, studentId) {
    if (checked) {
      const attendants = this.includeInAttendance(studentId);
      this.props.onAttendantsChange(attendants);
    } else {
      const attendants = this.removeFromAttendance(studentId);
      this.props.onAttendantsChange(attendants);
    }
  }

  /**
   * Shuffles an array
   * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
   * @param  {array} array
   * @return {array} shuffled array
   */
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
    if (groupSize < 1 || groupSize > this.props.users.length || groupSize % 1 !== 0) {
      // TODO: error without 'alert'?
      // eslint-disable-next-line no-alert
      alert('Invalid group size. Groups must be integer numbers between 1 and number of students');
    } else {
      const unassignedIds = [];
      this.props.users.forEach(user => {
        unassignedIds.push(user.id);
      });
      const unselectedStudents = this.shuffle(unassignedIds);
      const groups = [];
      while (unselectedStudents.length > 0) {
        const group = unselectedStudents.splice(0, groupSize);
        if (group.length < groupSize) {
          // remaining students get distributed in other groups
          group.forEach((student, index) => {
            groups[index % groups.length].push(student);
          });
        } else {
          groups.push(group);
        }
      }
      this.props.onGroupsChange(groups);
    }
  }

  renderGroupIndex(groupIndex, studentIndex, groupLength) {
    if (studentIndex === 0) {
      return (
        <td
          rowSpan={groupLength}
          className="hoverGreen"
          onClick={() => this.setState({ selectedGroup: groupIndex })}
        >
          {groupIndex + 1}
        </td>
      );
    }
    return null;
  }

  renderGroup(group, groupIndex) {
    if (group.length > 0) {
      return group.map((studentId, studentIndex) => (
        <tr key={studentId} style={rowGroupStyle(groupIndex, this.state.selectedGroup === groupIndex)}>
          {this.renderGroupIndex(groupIndex, studentIndex, group.length)}
          <td
            onClick={() => this.removeFromGroup(groupIndex, studentIndex)}
            className="hoverRed"
          >
            {this.props.users.find(user => user.id === studentId).name}
          </td>
          <td>
            <Checkbox
              style={styles.checkbox}
              onChange={(e) => this.handleCheckboxChange(e.target.checked, studentId)}
            />
          </td>
        </tr>
      ));
    }
    // empty group
    return (
      <tr key={groupIndex} style={rowGroupStyle(groupIndex, this.state.selectedGroup === groupIndex)}>
        {this.renderGroupIndex(groupIndex, 0, 1)}
        <td />
        <td />
      </tr>
    );
  }

  render() {
    return (
      <div>
        <style dangerouslySetInnerHTML={cssStyles} />
        <Row>
          <Col xs={12}>
            <Form
              inline
              onSubmit={e => {
                e.preventDefault();
                this.randomGroupGenerator(this.state.groupSize);
              }}
            >
              <span>Generate random groups of </span>
              <FormControl
                type="number"
                min="1"
                max="99"
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
              <Button onClick={() => this.randomGroupGenerator(1)}> Reset </Button>
            </Form>
            <br />
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <h4> Selected Students </h4>
            <Table bordered condensed>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Name</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {this.props.groups.map(this.renderGroup)}
              </tbody>
            </Table>
            <Button onClick={this.addGroup} disabled={this.isNewGroupButtonDisabled()}>
              <Glyphicon glyph="plus" />
              <span> New Group</span>
            </Button>
          </Col>
          <Col sm={4}>
            <Panel>
              <h4>Students to evaluate</h4>
              <p>
                You can also create random groups of your preferred size or arrange them manually.
              </p>
            </Panel>
            <Panel>
              <h4> Unselected Students </h4>
              <p>Pick unselected students from this list.</p>
              <Table striped bordered condensed fill>
                <tbody>
                  {this.unassignedStudents().map((studentId, i) => (
                    <tr key={i}>
                      <td
                        className="hoverBlue"
                        onClick={() => this.addToGroup(studentId)}
                      >
                        {this.props.users.find(student => student.id === studentId).name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}

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

function rowGroupStyle(groupIndex, isSelected) {
  const style = {};
  // stripe
  if (groupIndex % 2 === 0) {
    style.backgroundColor = '#f9f9f9';
  }

  if (isSelected) {
    style.borderLeft = 'solid 7px #2CA083';
  }
  return style;
}

// tried with styles, tried with Radius... only this worked
const cssStyles = {
  __html: `
    .hoverBlue:hover { background-color: rgba(66, 139, 202, 0.5); }
    .hoverRed:hover { background-color: rgba(217, 83, 79, 0.5); }
    .hoverGreen:hover { background-color: rgba(44, 160, 131, 0.5); }
  `,
};
