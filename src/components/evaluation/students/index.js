import React, { PropTypes, Component } from 'react';
import { Row, Col, Button, Form, FormControl, Panel, Table } from 'react-bootstrap';
import moment from 'moment';
import crypto from 'crypto';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import app, { currentUser } from '../../../app';
const attendanceService = app.service('/attendances');
const instanceService = app.service('/instances');

import TeamList from './team-list';
import UnselectedList from './unselected-list.js';
import Map from '../../localization';

const MODES = {
  instructor: 'instructor',
  student: 'student',
};

const translateAttendance = (value) => {
  switch (value) {
    case -1: return 'Absent';
    case 1: return 'Attended';
    default: return 'Unknown';
  }
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

  static propTypes = {
    attendances: PropTypes.array,
    instance: PropTypes.object,
    evaluation: PropTypes.object,
    participant: PropTypes.object,
    onAttendanceAdd: PropTypes.func,
    onAttendanceUpdate: PropTypes.func,
    onAttendanceRemove: PropTypes.func,
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

  state = {
    /**
     * All students in the course
     * @type {Array}
     */
    students: [],
    /**
     * @type {Number}
     * Value of groupSize input
     */
    groupSize: 1,
  }

  componentDidMount() {
    this.fetchAllStudents(this.props.instance);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchAllStudents(nextProps.instance);
  }

  fetchAllStudents = (instance) => {
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
  unassignedStudents = (attendances) => this.state.students
      // Filter non-students
      .filter(student => student.participant && student.participant.permission === 'read')
      // Filter already selected
      .filter(student => attendances.findIndex(a => a.userId === student.id) === -1)
      // Sort by name
      .sort((a, b) => a.name > b.name)

  addToGroup = (user, teamId) => {
    const query = {
      teamId,
      userId: user.id || user,
      evaluationId: this.props.evaluation.id,
    };
    // console.log('addToGroup', query);
    return attendanceService.create(query)
      .catch(error => this.setState({ error }));
  }

  removeFromGroup = (attendance) => attendanceService
    .remove(attendance.id || attendance)
    .catch(error => this.setState({ error }))

  updateOrCreateAttendance = (user, teamId = generateId()) => {
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

  reset = () => {
    const { attendances } = this.props;
    return Promise.all(attendances.map(a => attendanceService.remove(a.id)))
      .catch(error => this.setState({ error }));
  }

  randomGroupGenerator = (groupSize) => {
    if (groupSize < 1 || groupSize > this.state.students.length || groupSize % 1 !== 0) {
      // TODO: error without 'alert'?
      // eslint-disable-next-line no-alert
      return alert('Invalid group size. Groups must be integer numbers between 1 and number of students');
    }
    const unselectedStudents = shuffle(this.state.students.filter(s => s.participant.permission === 'read'));
    const teams = [];
    const promises = [];
    while (unselectedStudents.length > 0) {
      const users = unselectedStudents.splice(0, groupSize);
      if (users.length < groupSize) {
        // remaining students get distributed in other groups
        promises.push(...users.map((user, index) => {
          const team = teams[index % teams.length];
          team.users.push(user);
          return this.updateOrCreateAttendance(user, team.id);
        }));
      } else {
        const teamId = generateId();
        teams.push({
          id: teamId,
          users,
        });
        promises.push(...users.map(user => this.updateOrCreateAttendance(user, teamId)));
      }
    }
    return Promise.all(promises);
  }

  renderStudent = () => {
    const user = currentUser();
    const teamId = this.props.attendances.find(att => att.userId === user.id).teamId;
    const evaluation = this.props;
    const attendances = this.props.attendances
      .filter(att => att.teamId === teamId);

    return (
      <Col xs={12}>
        <Panel>
          <Table fill striped hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Started at</th>
                <th>Finished</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((attendance, i) => {
                const name = attendance.user ? attendance.user.name : 'Problem loading user info';

                const now = moment();
                const duration = evaluation.duration;
                // // When the evaluation finish
                const finishAt = moment(evaluation.finishAt);
                // // When the user started
                const startedAt = moment(attendance.startedAt);
                // // The user deadline
                const finishedAt = startedAt.isValid() ?
                  moment.min(finishAt, startedAt.clone().add(duration, 'ms'))
                  : finishAt;

                const time = startedAt.isValid() ? moment(startedAt).format('dddd, MMMM Do, HH:mm') : null;
                const isOver = now.isAfter(finishedAt);

                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{name}</td>
                    <td>{time || 'Not yet'}</td>
                    <td>{isOver ? 'Yes' : 'No'}</td>
                    <td>{translateAttendance(attendance.attended)}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Panel>
      </Col>
    );
  }

  renderInstructor = () => {
    // const all = this.state.students;
    const { attendances, evaluation } = this.props;
    // attendances.forEach(attendance => {
    //   attendance.user = all.find(student => student.id === attendance.userId);  // eslint-disable-line
    // });

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
                value={this.state.groupSize}
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
              <Button onClick={this.reset}> Reset </Button>
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
              evaluation={evaluation}
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
            <Panel>
              <h4>Localization of Students</h4>
              <p>Here you can see the location of your students</p>
              <div>
                <Map evaluation={evaluation} attendances={attendances} />
              </div>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const mode = ['admin', 'write'].includes(this.props.participant.permission) ? MODES.instructor : MODES.student;
    switch (mode) {
      case 'student': return this.renderStudent();
      case 'instructor': return this.renderInstructor();
      default: return null;
    }
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
