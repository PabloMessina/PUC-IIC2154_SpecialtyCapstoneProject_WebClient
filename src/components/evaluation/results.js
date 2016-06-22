/* eslint no-param-reassign:0 */

import React, { PropTypes, Component } from 'react';
import { Panel, Row, Col } from 'react-bootstrap';
// import { Pie as PieChart, Bar as BarChart } from 'react-chartjs';
import renderIf from 'render-if';

// import correction, { transform } from '../../utils/correction';
import app from '../../app';
const answerService = app.service('/answers');

// import { Colors } from '../../styles';

import {
  TrueFalse,
  MultiChoice,
  TShort,
  Correlation,
} from '../questions';
import {
  TrueFalse as TrueFalseResult,
  MultiChoice as MultiChoiceResult,
  TShort as TShortResult,
  Correlation as CorrelationResult,
} from './qresults';

// const COLORS = {
//   RED: Colors.RED,
//   GREEN: Colors.MAIN,
//   GRAY: Colors.GRAY,
// };

function questionFactory(qtype, props) {
  switch (qtype) {
    case 'trueFalse': return <TrueFalse {...props} />;
    case 'multiChoice': return <MultiChoice {...props} />;
    case 'tshort': return <TShort {...props} />;
    case 'correlation': return <Correlation {...props} />;
    default: return null;
  }
}

function dataFactory(question, answers) {
  const props = {
    question,
    answers,
  };
  switch (question.qtype) {
    case 'trueFalse': return <TrueFalseResult {...props} />;
    case 'multiChoice': return <MultiChoiceResult {...props} />;
    case 'tshort': return <TShortResult {...props} />;
    case 'correlation': return <CorrelationResult {...props} />;
    default: return null;
  }
}

export default class EvaluationResults extends Component {

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
      onAnswerChange: PropTypes.func,
      onFieldsChange: PropTypes.func,
      onFieldsAndAnswerChange: PropTypes.func,
      onQuestionRemove: PropTypes.func,
      onQuestionAdd: PropTypes.func,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      answers: [],
    };
    this.observeAnswers = this.observeAnswers.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  componentDidMount() {
    this.answerObserver = this.observeAnswers(this.props.evaluation).subscribe(answers => this.setState({ answers }));
  }

  componentWillUnmount() {
    if (this.answerObserver) this.answerObserver.unsubscribe();
  }

  observeAnswers(evaluation) {
    const query = {
      evaluationId: evaluation.id || evaluation,
    };
    return answerService.find({ query }).map(result => result.data);
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

    const graph = dataFactory(question, this.state.answers.filter(a => a.questionId === question.id));

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
    const questions = this.props.questions.filter(q => {
      if (!q.answer) console.log('Question has no answer:', q); // eslint-disable-line
      return q.answer;
    });

    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12}>
            {questions.map(this.renderRow)}
            {renderIf(questions.length === 0)(() =>
              <Panel>
                <h4>This evaluation has not questions</h4>
              </Panel>
            )}
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
