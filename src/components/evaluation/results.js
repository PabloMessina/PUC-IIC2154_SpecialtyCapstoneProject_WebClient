/* eslint no-param-reassign:0 */

import React, { PropTypes, Component } from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
import { Pie as PieChart } from 'react-chartjs';

import app from '../../app';
const answerService = app.service('/answers');

import { Colors } from '../../styles';

import { TrueFalse, MultiChoice, TShort } from '../questions';

const COLORS = {
  RED: Colors.RED,
  GREEN: Colors.MAIN,
  GRAY: Colors.GRAY,
};

function questionFactory(qtype, props) {
  switch (qtype) {
    case 'trueFalse': return <TrueFalse {...props} />;
    case 'multiChoice': return <MultiChoice {...props} />;
    case 'tshort': return <TShort {...props} />;
    default: return null;
  }
}

function dataFactory({ qtype, ...question }, answers) {
  switch (qtype) {
    case 'trueFalse': return dataFromTrueFalse(question, answers);
    default: return null;
  }
}

function dataFromTrueFalse(question, answers) {
  const data = answers
    .filter(a => a.questionId === question.id)
    .map(a => a.answer)
    .reduce((array, current) => {
      if (current.value === 1) array[0] += 1;
      else if (current.value === -1) array[1] += 1;
      else array[2] += 1;
      return array;
    }, [0, 0, 0]);

  const colors = [
    COLORS.GREEN,
    COLORS.RED,
    COLORS.GRAY,
  ];

  const graph = {
    labels: ['True', 'False', 'Unanswered'],
    datasets: [{
      data,
      backgroundColor: colors,
      hoverBackgroundColor: colors,
    }],
  };

  return <PieChart data={graph} />;
}

export default class MinTemplate extends Component {

  static get propTypes() {
    return {
      mode: PropTypes.string,
      pool: PropTypes.array,
      selected: PropTypes.array,
      tags: PropTypes.array,
      hidden: PropTypes.array,

      // From parent
      organization: PropTypes.object,
      course: PropTypes.object,
      participant: PropTypes.object,
      evaluation: PropTypes.object,
      answers: PropTypes.object,
      questions: PropTypes.array,
      interval: PropTypes.number,

      onEvaluationChange: PropTypes.func,
      onQuestionsChange: PropTypes.func,
      onAnswerChange: PropTypes.func,
      onFieldsChange: PropTypes.func,
      onQuestionRemove: PropTypes.func,
      onQuestionAdd: PropTypes.func,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      answers: [],
    };
    this.fetchAnswer = this.fetchAnswer.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount() {
    this.fetchAnswer(this.props.evaluation);
  }

  fetchAnswer(evaluation) {
    const query = {
      evaluationId: evaluation.id || evaluation,
      // $populate: ['question'],
    };
    return answerService.find({ query })
      .then(result => result.data)
      .then(answers => this.setState({ answers, error: null }))
      .catch(error => this.setState({ error }));
  }


  renderRow(question, index) {
    const element = questionFactory(question.qtype, {
      question,
      identifier: index + 1,
      answer: question.answer,
      fields: question.fields,
      disabled: true,
      mode: 'reader',
    });

    const graph = dataFactory(question, this.state.answers);

    return (
      <Row key={index} style={styles.row}>
        <Panel>
          <Col xs={12} md={6}>
            {element}
          </Col>
          <Col xs={12} md={6}>
            {graph}
          </Col>
        </Panel>
      </Row>
    );
  }

  render() {
    const { questions } = this.props;

    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12}>
            {questions.filter(q => q.qtype === 'trueFalse').map(this.renderRow)}
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
