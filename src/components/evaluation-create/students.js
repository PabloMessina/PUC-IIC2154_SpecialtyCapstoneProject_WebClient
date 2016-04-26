import React, { Component } from 'react';
import { Checkbox, Grid, Row, Col, Table, Button, Glyphicon } from 'react-bootstrap';


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
      groups: [[1, 2], [5, 6, 8]],
      unselectedStudents: [0, 3, 4, 7, 9],
      selectedGroup: 0,
    };

    this.renderGroup = this.renderGroup.bind(this);
    this.addGroup = this.addGroup.bind(this);
    this.isButtonDisabled = this.isButtonDisabled.bind(this);
    this.rowGroupStyle = this.rowGroupStyle.bind(this);
  }

  addToGroup(studentIndex) {
    const groups = [...this.state.groups];
    groups[this.state.selectedGroup].push(this.state.unselectedStudents[studentIndex]);
    const unselectedStudents = [...this.state.unselectedStudents];
    unselectedStudents.splice(studentIndex, 1);

    this.setState({ unselectedStudents, groups });
  }

  removeFromGroup(groupIndex, studentIndex, studentId) {
    const groups = [...this.state.groups];
    groups[groupIndex].splice(studentIndex, 1);

    // delete empty group
    if (groups[groupIndex].length === 0) {
      groups.splice(groupIndex, 1);
      if (this.state.selectedGroup === groupIndex) {
        this.state.selectedGroup = 0;
      }
    }

    const unselectedStudents = [...this.state.unselectedStudents];
    unselectedStudents.push(studentId);

    this.setState({ unselectedStudents, groups });
  }

  addGroup() {
    const groups = [...this.state.groups];
    groups.push([]);
    this.setState({ groups, selectedGroup: groups.length - 1 });
  }

  rowGroupStyle(groupIndex) {
    const style = { backgroundColor: groupIndex % 2 === 0 ? '#f9f9f9' : '' };
    if (this.state.selectedGroup === groupIndex) {
      style.border = 'solid 2px #2CA083';
      //debugger;
    }
    return style;
  }

  renderGroupIndex(groupIndex, studentIndex, groupLength) {
    if (studentIndex === 0) {
      return (
        <td
          rowSpan={groupLength}
          onClick={() => this.setState({ selectedGroup: groupIndex })}
        >
        {groupIndex + 1
        }</td>
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
            <td
              onClick={() => this.removeFromGroup(groupIndex, studentIndex, studentId)}
            >
              {this.props.students[studentId].name}
            </td>
            <td> <Checkbox /> </td>
          </tr>
        ))
      );
    }

    return (
      <tr style={this.rowGroupStyle(groupIndex)}>
        {this.renderGroupIndex(groupIndex, 0, 1)}
        <td />
        <td />
      </tr>
    );
  }

  isButtonDisabled() {
    return this.state.groups[this.state.groups.length - 1].length === 0;
  }

  render() {
    return (
      <div style={styles.container}>
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
        </Col>
        <Col md={4}>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
            {this.state.unselectedStudents.map((studentId, i) => (
              <tr key={i}>
                <td onClick={() => this.addToGroup(i)}> {this.props.students[studentId].name} </td>
              </tr>
            ))}
            </tbody>
          </Table>
        </Col>
        <Col md={8}>
          <Button onClick={this.addGroup} disabled={this.isButtonDisabled()}><Glyphicon glyph="plus" /> New Group </Button>
        </Col>
      </div>
    );
  }
}

Students.propTypes = {
  children: React.PropTypes.any,
  students: React.PropTypes.array,
};

const styles = {
  container: {

  },
};
