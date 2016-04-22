import React, { Component } from 'react';
import { Button, Input } from 'react-bootstrap';
import { Router } from 'react-router';

import app from '../../app';

const courseService = app.service('/courses');
const participantService = app.service('/participants');
const membershipService = app.service('/memberships');

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
      users: React.PropTypes.array,
      selectedStudents: React.PropTypes.array,
      description: React.PropTypes.string,
      associatedAtlases: React.PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      name: '',
      description: '',
      selectedTeachers: [],
      users: [],
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
      users: this.props.users,
      selectedStudents: this.props.selectedStudents,
      selectedTeachers: this.props.selectedTeachers,
      atlases: this.props.atlases,
      associatedAtlases: this.props.associatedAtlases,
    };
    this.addStudent = this.addStudent.bind(this);
    this.addTeachers = this.addTeacher.bind(this);
    this.addAtlas = this.addAtlas.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const options = {
      name: this.state.name,
      description: this.state.description,
      users: this.state.users, /* pide participants */
      /* organizationId: URL */
    };

    return courseService.create(options).then(course => {
      console.log(course);
    }).catch(err => {
      console.log(err);
    });
  }

  fetchUsers() {
    let query = {
      organizationId: 1,  /* URL */
    };
    return membershipService.find({ query }).then(result => {
      query = {
        id: { $in: result.data.map(row => row.userId) },
      };
    /*  return userService.find({ query }); */
      return participantService.find({ query });
    }).then(result => {
      this.setState({ users: result.data });
    }).catch(err => {
      console.log("Can't fetch users", err);
    });
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
            {this.state.users.map(user => (
              <option value={user} onClick={() => this.addTeacher(user)}>
                {user}
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
            {this.state.users.map(user => (
              <option value={user} onClick={() => this.addStudent(user)}>
                {user}
              </option>
            ))}
          </Input>
          <p> {this.props.location.pathname} </p>
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
