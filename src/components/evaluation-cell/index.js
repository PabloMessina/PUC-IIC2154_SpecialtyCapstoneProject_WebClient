import React, { PropTypes } from 'react';
import Icon from 'react-fa';
import moment from 'moment';
import renderIf from 'render-if';

import { calculateDuration } from '../../utils/time';

const EvaluationCell = ({ style, evaluation, length, onEvaluationClick, ...props }) => {
  const duration = calculateDuration(evaluation);
  const date = moment(evaluation.startAt).format('dddd, MMMM Do, HH:mm');

  const description = evaluation.description && evaluation.description.length > 140
    ? `${evaluation.description.substr(0, length)}...`
    : evaluation.description;

  return (
    <div style={{ ...styles.container, ...style }} {...props}>
      <h5 style={styles.title}>
        <a href="#" onClick={() => onEvaluationClick(evaluation)}>{evaluation.title}</a>
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
    </div>
  );
};

EvaluationCell.propTypes = {
  style: PropTypes.object,
  evaluation: PropTypes.object,
  onEvaluationClick: PropTypes.func,
  length: PropTypes.number,
};

EvaluationCell.defaultProps = {
  length: 140,
};

export default EvaluationCell;

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
