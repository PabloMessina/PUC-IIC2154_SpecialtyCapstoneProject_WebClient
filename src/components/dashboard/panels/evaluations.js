import React, { Component, PropTypes } from 'react';
import { Panel } from 'react-bootstrap';
import { withRouter } from 'react-router';
import renderIf from 'render-if';

import app, { currentUser } from '../../../app';
const evaluationService = app.service('/evaluations');
const attendanceService = app.service('/attendances');

import Title from './common/title';
import EvaluationCell from '../../evaluation-cell/';

class EvaluationsPanel extends Component {

  static get propTypes() {
    return {
      router: PropTypes.object,
      query: PropTypes.object,
      style: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      evaluations: [],
      total: null,
    };
    this.renderEvaluation = this.renderEvaluation.bind(this);
    this.fetchEvaluations = this.fetchEvaluations.bind(this);
    this.onEvaluationClick = this.onEvaluationClick.bind(this);
  }

  componentDidMount() {
    this.fetchEvaluations(this.props.query);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.query !== this.props.query) {
      this.fetchEvaluations(nextProps.query);
    }
  }

  onEvaluationClick(evaluation) {
    const url = `/evaluations/show/${evaluation.id}`;
    return this.props.router.push(url);
  }

  fetchEvaluations(custom) {
    let query = {
      userId: currentUser().id,
      $limit: 10,
    };
    return attendanceService.find({ query })
      .then(result => result.data)
      .then(attendances => {
        query = {
          id: { $in: attendances.map(attendance => attendance.evaluationId) },
          $populate: ['instance'],
          $sort: { startAt: -1 },
          ...custom,
        };
        return evaluationService.find({ query });
      })
      .then(({ data, total }) => this.setState({ evaluations: data, total }));
  }

  renderEvaluation(evaluation) {
    return (
      <div style={styles.cell} key={evaluation.id}>
        <hr />
        <EvaluationCell
          evaluation={evaluation}
          onEvaluationClick={this.onEvaluationClick}
          length={80}
        />
      </div>
    );
  }

  render() {
    const { style } = this.props;
    const { evaluations, total } = this.state;
    return (
      <Panel style={{ ...styles.container, ...style }}>
        <Title title="Evaluations" icon="exclamation" count={total} />
        {renderIf(evaluations.length)(() =>
          evaluations.map(this.renderEvaluation)
        )}
        {renderIf(evaluations.length === 0)(() =>
          <div>
            <hr />
            <p>Nothing to show here</p>
          </div>
        )}
      </Panel>
    );
  }
}

export default withRouter(EvaluationsPanel);

const styles = {
  container: {

  },
  cell: {
    paddingLeft: 10,
    paddingRight: 10,
  },
};
