/* eslint react/prefer-stateless-function:0 react/no-multi-comp:0 */

import React, { PropTypes, Component } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Button, Form, FormControl, Panel } from 'react-bootstrap';

import app from '../../app';
const attendanceService = app.service('/attendances');
const instanceService = app.service('/instances');

import { Colors } from '../../styles';


class Student extends Component {

  static get propTypes() {
    return {
      student: PropTypes.any,
      setSelectedTeam: PropTypes.func,
    };
  }

  render() {
    const { setSelectedTeam, student } = this.props;
    const user = student.user;
    const teamId = student.teamId;

    return (
      <ListGroupItem
        onClick={e => { e.stopPropagation(); setSelectedTeam(teamId); }}
      >
        {user ? user.name : 'Loading...'}
      </ListGroupItem>
    );
  }
}

class Team extends Component {

  static get propTypes() {
    return {
      team: PropTypes.object,
      active: PropTypes.bool,
      setSelectedTeam: PropTypes.func,
    };
  }

  render() {
    const { team, active, setSelectedTeam } = this.props;
    const style = active ? styles.selectedTeam : {};

    return (
      <ListGroup style={style}>
        {team.users.map((student, i) =>
          <Student
            key={i}
            student={student}
            setSelectedTeam={setSelectedTeam}
          />
        )}
      </ListGroup>
    );
  }
}


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


export default class Students extends Component {

  static get propTypes() {
    return {
      participants: PropTypes.array,
      attendances: PropTypes.array,
      instance: PropTypes.object,
      evaluation: PropTypes.object,
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
       * @type {String}
       * To which group unselectedStudents will be added.
       */
      selectedGroupId: null,
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

    // this.renderGroup = this.renderGroup.bind(this);
    // this.isNewGroupButtonDisabled = this.isNewGroupButtonDisabled.bind(this);
    this.randomGroupGenerator = this.randomGroupGenerator.bind(this);
    this.unassignedStudents = this.unassignedStudents.bind(this);
    this.fetchAllStudents = this.fetchAllStudents.bind(this);
    this.setSelectedTeam = this.setSelectedTeam.bind(this);
  }


   /**
    * Sensible default: every evaluation will be answered by a single student
    */
  componentDidMount() {
    this.fetchAllStudents(this.props.instance.id);
  }

  setSelectedTeam(teamId) {
    this.setState({ selectedGroupId: teamId });
  }

  fetchAllStudents(instanceId) {
    const query = {
      id: instanceId,
      $populate: 'user',
    };
    return instanceService.find({ query })
      .then(result => result.data[0])
      .then(instance => {
        // All students in the course instance
        this.setState({ students: instance.users, error: null });
      })
      .catch(error => this.setState({ error }));
  }

  /**
   * Students not assigned to any group
   * @return {array} Array with attendance objects
   */
  unassignedStudents(attendances) {
    return this.state.students
      .filter(user => attendances.findIndex(attendance => attendance.userId === user.id) === -1)
      .sort((a, b) => a.name > b.name);
  }

  /**
   * Adds a student to a team
   */
  addToGroup(user) {
    const selectedGroupId = this.state.selectedGroupId || user.id; // auto-select group
    this.setState({ selectedGroupId });
    const query = {
      teamId: selectedGroupId,
      userId: user.id,
      evaluationId: this.props.evaluation.id,
    };
    return attendanceService.create(query)
      .then(attendance => this.props.onAttendanceAdd(attendance))
      .catch(error => this.setState({ error }));
  }

  // removeFromGroup(teamId, studentId) {
  //   let groups = [...this.props.groups];
  //   groups[groupIndex].splice(studentIndex, 1);
  //
  //   let selectedGroup = this.state.selectedGroup;
  //   // delete empty group
  //   if (groups[groupIndex].length === 0) {
  //     groups.splice(groupIndex, 1);
  //     if (selectedGroup >= groupIndex) {
  //       selectedGroup--;
  //     }
  //     if (groups.length === 0) {
  //       groups = [[]];
  //       selectedGroup = 0;
  //     }
  //   }
  //
  //   this.setState({ selectedGroup });
  //   this.props.onGroupsChange(groups);
  //   const attendanceId = this.props.attendances.find((attendance) => groupIndex === attendance.teamId);
  //   if(attendanceId) {
  //     const query = { attendanceId };
  //     return attendanceService.remove(query);
  //   }
  // }
  //


  updateOrCreateAttendance(userId, evaluationId, teamId) {
    const query = {
      userId,
      evaluationId,
      $limit: 1,
    };
    return attendanceService.find({ query })
      .then(result => result.data[0])
      .then(attendance => {
        if (attendance) {
          return attendanceService.patch(attendance.id, { ...attendance, teamId })
            .then(result => this.props.onAttendanceUpdate(result));
        } else {
          return attendanceService.create({ teamId, userId, evaluationId })
            .then(result => this.props.onAttendanceAdd(result));
        }
      })
      .catch(error => this.setState({ error }));
  }

  randomGroupGenerator(groupSize) {
    const participants = this.props.participants;
    if (groupSize < 1 || groupSize > participants.length || groupSize % 1 !== 0) {
      // TODO: error without 'alert'?
      // eslint-disable-next-line no-alert
      return alert('Invalid group size. Groups must be integer numbers between 1 and number of students');
    }
    const unselectedStudents = shuffle(this.props.participants.map(p => p.user));
    const teams = [];
    const evaluation = this.props.evaluation;
    while (unselectedStudents.length > 0) {
      const users = unselectedStudents.splice(0, groupSize);
      if (users.length < groupSize) {
        // remaining students get distributed in other groups
        users.forEach((user, index) => {
          const team = teams[index % teams.length];
          team.users.push(user);
          this.updateOrCreateAttendance(user.id, evaluation.id, team.id);
        });
      } else {
        const teamId = users[0].id;
        teams.push({
          id: teamId,
          users,
        });
        users.forEach((user) => this.updateOrCreateAttendance(user.id, evaluation.id, teamId));
      }
    }
    return teams;
  }


  render() {
    const all = this.state.students;
    const attendances = this.props.attendances;
    attendances.forEach(attendance => {
      attendance.user = all.find(student => student.id === attendance.userId);  // eslint-disable-line
    });

    const teams = Students.attendancesToGroup(attendances);
    const unselected = this.unassignedStudents(attendances);

    // TODO: onClick global?
    return (
      <div onClick={() => this.setSelectedTeam(null)}>
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
            {teams.map((team, i) =>
              <Team
                key={i}
                team={team}
                active={this.state.selectedGroupId === team.id}
                setSelectedTeam={this.setSelectedTeam}
              />
            )}
          </Col>
          <Col sm={4}>
            <Panel>
              <h4>Students to evaluate</h4>
              <p>You can also create random groups of your preferred size or arrange them manually.</p>
            </Panel>
            <Panel>
              <h4> Unselected Students </h4>
              {unselected.length > 0 ?
                <p>Pick unselected students from this list.</p>
              :
                <p style={styles.grayText}>All students are assigned to groups.</p>
              }
              <ListGroup>
                {unselected.map(student => (
                  <ListGroupItem
                    key={student.id}
                    onClick={() => this.addToGroup(student)}
                  >
                    {student.name}
                  </ListGroupItem>
                ))}
              </ListGroup>
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
  grayText: {
    color: '#d3d3d3',
  },
  selectedTeam: {
    border: `2px solid ${Colors.MAIN}`,
    borderRadius: '4px',
  },
};
