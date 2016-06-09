import React, { Component, PropTypes } from 'react';
import { Alert } from 'react-bootstrap';
import Icon from 'react-fa';
import moment from 'moment';
import renderIf from 'render-if';
import truncate from 'lodash/truncate';
import ErrorAlert from '../error-alert';

import app from '../../app';
const attendanceService = app.service('/attendances');

import { calculateDuration } from '../../utils/time';

export default class EvaluationCell extends Component {
// const EvaluationCell = ({ style, evaluation, length, onEvaluationClick, ...props }) => {
  static get propTypes() {
    return {
      style: PropTypes.object,
      evaluation: PropTypes.object,
      onEvaluationClick: PropTypes.func,
      length: PropTypes.number,
    };
  }

  static get defaultProps() {
    return {
      length: 140,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      noAttendances: false,
      error: null,
    };
  }


  componentDidMount() {
    const query = {
      evaluationId: this.props.evaluation.id,
      $limit: 1,
    };
    attendanceService.find({ query })
      .then(result => result.data)
      .then(attendances => attendances.length === 0)
      .then(noAttendances => this.setState({ noAttendances, error: null }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const { evaluation, style, onEvaluationClick } = this.props;
    const { noAttendances, error } = this.state;

    const duration = calculateDuration(evaluation);
    const date = moment(evaluation.startAt).format('dddd, MMMM Do, HH:mm');

    const description = truncate(evaluation.description, { length });

    return (
      <div style={{ ...styles.container, ...style }} {...this.props}>
        <h5 style={styles.title}>
          <a onClick={() => onEvaluationClick(evaluation)}>{evaluation.title}</a>
          {renderIf(evaluation.responsable)(() =>
            <small style={styles.small}>by {evaluation.responsable.name}</small>
          )}
          {renderIf(!evaluation.published)(() =>
            <small className="pull-right"><strong>Draft</strong></small>
          )}
        </h5>
        <p style={styles.description}>
          {description}
        </p>
        <ul style={styles.list} className="list-unstyled">
          <li style={styles.text}>
            <Icon name="calendar" /> {date}
          </li>
          <li style={styles.text}>
            <Icon name="clock-o" /> {duration ? `Duration: ${duration}` : 'No duration information'}
          </li>
        </ul>
        {renderIf(noAttendances)(
          <Alert bsStyle="warning">This evaluation has no students assigned!</Alert>
        )}
        <ErrorAlert
          error={error}
          onDismiss={() => this.setState({ error: null })}
        />
      </div>
    );
  }
}

const styles = {
  container: {

  },
  small: {
    marginLeft: 5,
  },
  description: {
    marginTop: 4,
    color: 'gray',
  },
  list: {
    paddingLeft: 20,
  },
  title: {
    cursor: 'pointer',
    marginBottom: 0,
  },
};
