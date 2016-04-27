import React, { Component } from 'react';
import { Checkbox, Col, Table, Button, Glyphicon, Form, FormControl } from 'react-bootstrap';


export default class Students extends Component {

  static get defaultProps() {
    return {
      students: [
           { id: 0, name: 'Lopez Patricio' },
           { id: 1, name: 'Andrighetti Tomas' },
           { id: 2, name: 'Astaburuaga Francisco' },
           { id: 3, name: 'Bobadilla Felipe' },
           { id: 4, name: 'Bustamante Jose' },
           { id: 5, name: 'Dragicevic Vicente' },
           { id: 6, name: 'Halabi Maria Constanza' },
           { id: 7, name: 'Messina Pablo' },
           { id: 8, name: 'Monsalve Geraldine' },
           { id: 9, name: 'Steinsapir Diego' },
      ],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      /**
       * [groups description]
       * @type {Array}
       * Every group is an array inside this array.
       * Students included here should not be in unselectedStudents.
       */
      groups: [[1, 2], [4], [5, 6, 8]],
      /**
       * [unselectedStudents description]
       * @type {Array}
       * Students not assigned to any group.
       * Students included here should not be in the 'groups' array.
       */
      unselectedStudents: [0, 3, 7, 9],
      /**
       * [selectedGroup description]
       * @type {Number}
       * To which group unselectedStudents will be added.
       */
      selectedGroup: 0,
      /**
       * [groupSize description]
       * @type {Number}
       * Value of groupSize input
       */
      groupSize: 3,
    };

    this.renderGroup = this.renderGroup.bind(this);
    this.addGroup = this.addGroup.bind(this);
    this.isButtonDisabled = this.isButtonDisabled.bind(this);
    this.rowGroupStyle = this.rowGroupStyle.bind(this);
    this.generateRandomGroups = this.generateRandomGroups.bind(this);
  }

  generateRandomGroups() {
alert(this.groupSize)
  }

  addToGroup(studentIndex) {
    const groups = [...this.state.groups];
    groups[this.state.selectedGroup].push(this.state.unselectedStudents[studentIndex]);
    const unselectedStudents = [...this.state.unselectedStudents];
    unselectedStudents.splice(studentIndex, 1);

    this.setState({ unselectedStudents, groups });
  }

  removeFromGroup(groupIndex, studentIndex, studentId) {
    let groups = [...this.state.groups];
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

    const unselectedStudents = [...this.state.unselectedStudents];
    unselectedStudents.push(studentId);
    unselectedStudents.sort();

    this.setState({ unselectedStudents, groups, selectedGroup });
  }

  addGroup() {
    const groups = [...this.state.groups];
    groups.push([]);
    this.setState({ groups, selectedGroup: groups.length - 1 });
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
    const arr = this.state.groups;
    return arr[arr.length - 1].length === 0;
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

  renderGroup(group, groupIndex) {
    if (group.length > 0) {
      return (
        group.map((studentId, studentIndex) => (
          <tr style={this.rowGroupStyle(groupIndex)}>
            {this.renderGroupIndex(groupIndex, studentIndex, group.length)}
            <td onClick={() => this.removeFromGroup(groupIndex, studentIndex, studentId)} >
              {this.props.students[studentId].name}
            </td>
            <td>
              <Checkbox style={styles.checkbox} />
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
            <span>Generar grupos aleatoreos de </span>
            <FormControl
              type="text"
              maxLength="2"
              onkeypress="return event.charCode >= 48 && event.charCode <= 57"
              placeholder="3"
              style={styles.groupSizeInput}
              onChange={e => { this.setState({ groupSize: e.target.value }); }}
            />
            <span> personas </span>
            <Button onClick={this.generateRandomGroups}>Generar</Button>
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
              {this.state.groups.map(this.renderGroup)}
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
              {this.state.unselectedStudents.map((studentIndex, i) => (
                <tr key={i}>
                  <td onClick={() => this.addToGroup(i)}>
                    {this.props.students[studentIndex].name}
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
  students: React.PropTypes.array,
};

const styles = {
  checkbox: {
    margin: 'auto',
  },
  groupSizeInput: {
    width: '50px',
  },
};
