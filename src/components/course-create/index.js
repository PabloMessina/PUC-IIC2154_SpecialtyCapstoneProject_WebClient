import React, { Component } from 'react';
import { Button, Input } from 'react-bootstrap';

import app from '../../app';

const courseService = app.service('/courses');

/**
 * Component life-cycle:
 * https://facebook.github.io/react/docs/component-specs.html
 */

/**
 * React + Bootstrap components:
 * https://react-bootstrap.github.io/components.html
 */

export default class CourseCreate extends Component {

  static get propTypes() {
    return {
      name: React.PropTypes.string,
      teachers: React.PropTypes.array,
      selectedTeachers: React.PropTypes.array,
      atlases: React.PropTypes.array,
      students: React.PropTypes.array,
      selectedStudents: React.PropTypes.array,
      description: React.PropTypes.string,
      associatedAtlases: React.PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      name: '',
      description: '',
      teachers: [],
      selectedTeachers: [],
      students: [],
      selectedStudents: [],
      atlases: [],
      associatedAtlases: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      description: this.props.description,
      teachers: this.props.teachers,
      selectedTeachers: this.props.selectedTeachers,
      atlases: this.props.atlases,
      associatedAtlases: this.props.associatedAtlases,
      students: this.props.students,
      selectedStudents: this.props.selectedStudents,
    };
    this.addStudent = this.addStudent.bind(this);
    this.addTeachers = this.addTeacher.bind(this);
    this.addAtlas = this.addAtlas.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    // Prevent page refresh
    e.preventDefault();
  }

  addStudent(student) {
    const selectedStudents = [...this.state.selectedStudents, student];
    this.setState({ selectedStudents });
  }

  addTeacher(teacher) {
    const selectedTeachers = [...this.state.selectedTeachers, teacher];
    this.setState({ selectedTeachers });
  }

  addAtlas(atlas) {
    const associatedAtlases = [...this.state.associatedAtlases, atlas];
    this.setState({ associatedAtlases });
  }

  buttonSubmit() {
    return { prueba: 'hola' };
  }

  render() {
    return (
      <div style={styles.container}>
        <form onSubmit={this.onSubmit}>
          <Input
            type="text"
            value={this.state.name}
            placeholder="Enter course name"
            label="Course Name"
            onChange={e => this.setState({ name: e.target.value })}
          />

          <Input
            type="textarea"
            label="Course Description"
            placeholder="Example: This course
            focuses in the study of the human body..."
            onChange={e => this.setState({ description: e.target.value })}
          />

          <Input type="select" label="Select Teachers" multiple>
            {this.state.teachers.map(teacher => (
              <option value={teacher} onClick={() => this.addTeacher(teacher)}>
                {teacher}
              </option>
            ))}
          </Input>

          <Input type="select" label="Select Asociated Atlases" multiple >
            {this.state.atlases.map(atlas => (
              <option value={atlas} onClick={() => this.addAtlas(atlas)}>
                {atlas}
              </option>
            ))}
          </Input>

          <Input type="select" label="Select Students" multiple >
            {this.state.students.map(student => (
              <option value={student} onClick={() => this.addStudent(student)}>
                {student}
              </option>
            ))}
          </Input>

          <Button bsStyle="primary" type="submit">Submit Course</Button>
        </form>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
