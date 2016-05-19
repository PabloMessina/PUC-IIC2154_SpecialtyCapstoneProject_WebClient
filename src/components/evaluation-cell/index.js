import React, { PropTypes } from 'react';
import Icon from 'react-fa';
import moment from 'moment';

import { calculateDuration } from '../../utils/time';

const EvaluationCell = ({ style, evaluation, onEvaluationClick, ...props }) => {
  const duration = calculateDuration(evaluation);
  const date = moment(evaluation.startAt).format('dddd, MMMM Do, HH:mm');
  return (
    <div style={{ ...styles.container, ...style }} {...props}>
      <h5 style={styles.title}>
        <a href="#" onClick={() => onEvaluationClick(evaluation)}>{evaluation.title}</a>
        <small style={styles.small}>by {evaluation.responsable.name}</small>
      </h5>
      <p style={styles.description}>
        {evaluation.description}
      </p>
      <ul style={styles.list} className="list-unstyled">
        <li style={styles.text}>
          <Icon name="calendar" /> {date}
        </li>
        <li style={styles.text}>
          <Icon name="clock-o" /> {duration ? `Duration: ${duration}` : 'No duration information'}
        </li>
      </ul>
      <hr />
    </div>
  );
};

EvaluationCell.propTypes = {
  style: PropTypes.object,
  evaluation: PropTypes.object,
  onEvaluationClick: PropTypes.func,
};

export default EvaluationCell;

const styles = {
  container: {

  },
  small: {
    marginLeft: 5,
  },
  description: {
    paddingLeft: 10,
  },
  list: {
    paddingLeft: 20,
  },
  title: {
    cursor: 'pointer',
  },
};
