import React, { Component } from 'react';
import { Checkbox, Grid, Row, Col, Table } from 'react-bootstrap';


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
    groups[groupIndex].splice(studentIndex, 1);   // TODO: ultimo del grupo?
    const unselectedStudents = [...this.state.unselectedStudents];
    unselectedStudents.push(studentId);

    this.setState({ unselectedStudents, groups });
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

  render() {
    return (
      <div style={styles.container}>
        <Col md={8}>
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>Group</th>
                <th>Name</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
            {this.state.groups.map((group, groupIndex) => (
              group.map((studentId, studentIndex) => (
                <tr>
                  {this.renderGroupIndex(groupIndex, studentIndex, group.length)}
                  <td
                    onClick={() => this.removeFromGroup(groupIndex, studentIndex, studentId)}
                  >
                    {this.props.students[studentId].name}
                  </td>
                  <td> <Checkbox /> </td>
                </tr>
              ))
            ))}
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
