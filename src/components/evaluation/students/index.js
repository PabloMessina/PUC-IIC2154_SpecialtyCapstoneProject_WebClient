import React, { PropTypes, Component } from 'react';
import { Row, Col, Button, Form, FormControl, Panel } from 'react-bootstrap';
import crypto from 'crypto';

import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import app, { currentUser } from '../../../app';
const attendanceService = app.service('/attendances');
const instanceService = app.service('/instances');

import TeamList from './team-list';
import UnselectedList from './unselected-list.js';

const MODES = {
  instructor: 'instructor',
  student: 'student',
};

/**
 * Shuffles an array
 * http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param  {array} array
 * @return {array} shuffled array
 */
function shuffle(original) {
  const array = [...original];
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

function generateId() {
  return crypto.randomBytes(16).toString('hex');
}


class Students extends Component {

  static get propTypes() {
    return {
      // participants: PropTypes.array.isRequired,
      attendances: PropTypes.array,
      instance: PropTypes.object,
      evaluation: PropTypes.object,
      participant: PropTypes.object,
      onAttendanceAdd: PropTypes.func,
      onAttendanceUpdate: PropTypes.func,
      onAttendanceRemove: PropTypes.func,
    };
  }

  static attendancesToGroup(attendances) {
    return attendances.reduce((groups, attendant) => {
      const index = groups.findIndex(group => group.id === attendant.teamId);
      if (index > -1) {
        groups[index].users.push(attendant);
      } else {
        groups.push({ id: attendant.teamId, users: [attendant] });
      }
      return groups;
    }, []);
  }

  constructor(props) {
    super(props);
    this.state = {
      /**
       * All students in the course
       * @type {Array}
       */
      students: [],
      /**
       * @type {Number}
       * Value of groupSize input
       */
      groupSize: 3,
    };

    this.randomGroupGenerator = this.randomGroupGenerator.bind(this);
    this.unassignedStudents = this.unassignedStudents.bind(this);
    this.fetchAllStudents = this.fetchAllStudents.bind(this);
    this.addToGroup = this.addToGroup.bind(this);
    this.removeFromGroup = this.removeFromGroup.bind(this);
    this.updateOrCreateAttendance = this.updateOrCreateAttendance.bind(this);
  }

  componentDidMount() {
    this.fetchAllStudents(this.props.instance);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchAllStudents(nextProps.instance);
  }

  fetchAllStudents(instance) {
    const query = {
      id: instance.id || instance,
      $populate: 'user',
      $limit: 1,
    };
    return instanceService.find({ query })
      .then(result => result.data[0])
      // All students in the course instance
      .then(({ users }) => this.setState({ students: users, error: null }))
      .catch(error => this.setState({ error }));
  }

  /**
   * Students not assigned to any group
   * @return {array} Array with attendance objects
   */
  unassignedStudents(attendances) {
    return this.state.students
      .filter(student => attendances.findIndex(a => a.userId === student.id) === -1)
      .sort((a, b) => a.name > b.name);
  }

  addToGroup(user, teamId) {
    const query = {
      teamId,
      userId: user.id || user,
      evaluationId: this.props.evaluation.id,
    };
    // console.log('addToGroup', query);
    return attendanceService.create(query)
      .catch(error => this.setState({ error }));
  }

  removeFromGroup(user) {
    // console.log('removeFromGroup', user);
    const userId = user.id || user;
    const attendance = this.props.attendances.find(a => a.userId === userId);
    return attendanceService.remove(attendance.id)
      .catch(error => this.setState({ error }));
  }

  updateOrCreateAttendance(user, teamId = generateId()) {
    const userId = user.id || user;
    const evaluationId = this.props.evaluation.id;
    const query = {
      userId,
      evaluationId,
      $limit: 1,
    };

    return attendanceService.find({ query })
      .then(result => result.data[0])
      .then(attendance => {
        if (attendance) {
          return attendanceService.patch(attendance.id, { ...attendance, teamId });
        } else {
          return attendanceService.create({ teamId, userId, evaluationId });
        }
      })
      .catch(error => this.setState({ error }));
  }

  randomGroupGenerator(groupSize) {
    if (groupSize < 1 || groupSize > this.state.students.length || groupSize % 1 !== 0) {
      // TODO: error without 'alert'?
      // eslint-disable-next-line no-alert
      return alert('Invalid group size. Groups must be integer numbers between 1 and number of students');
    }
    const unselectedStudents = shuffle(this.state.students);
    const teams = [];
    while (unselectedStudents.length > 0) {
      const users = unselectedStudents.splice(0, groupSize);
      if (users.length < groupSize) {
        // remaining students get distributed in other groups
        users.forEach((user, index) => {
          const team = teams[index % teams.length];
          team.users.push(user);
          this.updateOrCreateAttendance(user.id, team.id);
        });
      } else {
        const teamId = generateId();
        teams.push({
          id: teamId,
          users,
        });
        users.forEach((user) => this.updateOrCreateAttendance(user.id, teamId));
      }
    }
    return teams;
  }

  renderMode(mode) {
    switch (mode) {
      case 'student': return this.renderStudent();
      case 'instructor': return this.renderInstructor();
      default: return null;
    }
  }

  renderStudent() {
    const user = currentUser();
    const attendances = this.props.attendances;
    const attendance = attendances.find(att => att.userId === user.id);
    const teamIds = attendances.filter(att => att.teamId === attendance.teamId).map(item => item.userId);
    const team = this.state.students.filter(student => teamIds.indexOf(student.id) > -1);
    return (
      <Row>
        <Panel>
          {team.map(student =>
            <p>{student.name}</p>
          )}
        </Panel>
      </Row>
    );
  }

  renderInstructor() {
    const all = this.state.students;
    const attendances = this.props.attendances;
    attendances.forEach(attendance => {
      attendance.user = all.find(student => student.id === attendance.userId);  // eslint-disable-line
    });

    if (this.state.error) {
      // console.log(this.state.error);
    }

    const teams = Students.attendancesToGroup(attendances);
    const unselected = this.unassignedStudents(attendances);

    return (
      <div>
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
            <TeamList
              teams={teams}
              updateOrCreateAttendance={this.updateOrCreateAttendance}
              removeFromGroup={this.removeFromGroup}
            />
          </Col>
          <Col sm={4}>
            <Panel>
              <h4>Students to evaluate</h4>
              <p>You can also create random groups of your preferred size or arrange them manually.</p>
            </Panel>
            <UnselectedList
              unselected={unselected}
              removeFromGroup={this.removeFromGroup}
            />
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const mode = ['admin', 'write'].includes(this.props.participant.permission) ? MODES.instructor : MODES.student;
    return (
      <div>
        {this.renderMode(mode)}
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Students); // eslint-disable-line


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
