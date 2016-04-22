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
  }

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.name,
      teachers: this.props.teachers,
      selectedTeachers: this.props.selectedTeachers,
      atlases: this.props.atlases,
      students: this.props.students,
      selectedStudents: this.props.selectedStudents,
      description: this.props.description,
      associatedAtlases: this.props.associatedAtlases,
    };
    this.addStudent = this.addStudent.bind(this);
    this.addTeachers = this.addTeacher.bind(this);
    this.addAtlas = this.addAtlas.bind(this);
    this.buttonSubmit = this.buttonSubmit.bind(this);
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

        <Button bsStyle="primary" onclick={() => this.buttonSubmit}> Submit Course </Button>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
