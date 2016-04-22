import React, { Component } from 'react';
import { Button, Input } from 'react-bootstrap';

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class CourseCreate extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      teachers: ['Constanza Halabi',
                 'Vicente Dragicevic',
                  'Pablo Messina'],
      selectedTeachers: [],
      atlases: ['Anatomy First Edition',
                '1001 Engineering Fundamental Problems',
                'Ancient History'],
      students: ['Diego Steinsapir',
                  'Geraldine Monsalve',
                  'José Bustamente'],
      selectedStudents: [],
      description: '',
      associatedAtlases: [],

    };
    this.addStudent = this.addStudent.bind(this);
    this.addTeachers = this.addTeacher.bind(this);
    this.addAtlas = this.addAtlas.bind(this);
  }

  addStudent(student) {
    // const students = [].concat(this.state.selectedStudents);
    // students.push(student);
    // this.setState({selectedStudents: students});
    const selectedStudents = [...this.state.selectedStudents, student];
    this.setState({ selectedStudents });
  }

  addTeacher(teacher) {
    // const students = [].concat(this.state.selectedStudents);
    // students.push(student);
    // this.setState({selectedStudents: students});
    const selectedTeachers = [...this.state.selectedTeachers, teacher];
    this.setState({ selectedTeachers });
  }

  addAtlas(atlas) {
    // const students = [].concat(this.state.selectedStudents);
    // students.push(student);
    // this.setState({selectedStudents: students});
    const associatedAtlases = [...this.state.associatedAtlases, atlas];
    this.setState({ associatedAtlases });
  }

  render() {
    return (
      <div style={styles.container}>
        <Input
          type="text"
          value={this.state.name}
          placeholder="Enter course name"
          label="Course Name"
          onChange={e => this.setState({ name: e.target.value })}
        />
        <Input type="select" label="Select Teachers" multiple>
          {this.state.teachers.map(teacher => {
            return (
              <option value={teacher} onClick= {() => this.addTeacher(teacher)}>
              {teacher}
             </option>
            );
          })}
        </Input>
        <Input type="select" label="Select Students" multiple >
          {this.state.students.map(student => {
            return (
              <option value={student} onClick= {() => this.addStudent(student)}>
              {student}
             </option>
            );
          })}
        </Input>
        <Input type="textarea" label="Course Description"
          placeholder="Example: This course
          focuses in the study of the human body..."
          onChange={e => this.setState({ description: e.target.value })}
        />
        <Input type="select" label="Select Asociated Atlases" multiple >
          {this.state.atlases.map(atlas => {
            return (
              <option value={atlas} onClick= {() => this.addAtlas(atlas)}>
              {atlas}
             </option>
            );
          })}
        </Input>

      </div>
    );
  }
}

const styles = {
  container: {

  },
};
