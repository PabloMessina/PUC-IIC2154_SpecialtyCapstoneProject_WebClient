import React, { PropTypes, Component } from 'react';
import Chart from 'chart.js';
import { Colors } from '../../../styles';

import correction from '../../../utils/correction';

export default class Correlation extends Component {

  static get propTypes() {
    return {
      question: PropTypes.object,
      answers: PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      question: { id: 1 },
      answers: [],
    };
  }

  render() {
    const { answers, question } = this.props;
    // const value = answer.value;
    const correct = question.answer;

    const size = question.answer.choices.length;
    const labels = Array(size + 1).fill(0).map((_, i) => (1 / size * i));

    const dataAnswers = answers
      .map(answer => correction(question.qtype, correct, answer.answer).correct);
    const data = Array(size + 1).fill(0);
    dataAnswers.forEach(elem => (data[labels.findIndex(e => e === elem)] += 1));

    const graph = {
      labels,
      datasets: [{
        label: '',
        data,
        backgroundColor: Colors.MAIN,
      }],
    };

    const ctx = document.getElementById(question.id);
    if (ctx) {
      const myChart = new Chart(ctx, {
        type: 'bar',
        data: graph,
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
              scaleLabel: {
                display: true,
                labelString: 'number of students',
              },
            }],
            xAxes: [{
              gridLines: {
                display: false,
              },
              scaleLabel: {
                display: true,
                labelString: 'score',
              },
            }],
          },
        },
      });
    }

    const events = {
      mousemove: () => true,
      mouseout: () => true,
      click: () => true,
      touchstart: () => true,
      touchmove: () => true,
      touchend: () => true,
      hover: () => true,
    };

    return (
      <div styles={styles.container}>
        <canvas
          id={question.id}
          data-paper-resize
          style={styles.chart}
          {...events}
        />
      </div>
    );
  }

}

const styles = {
  container: {
    // height: 500,
    // width: 400,
  },
  chart: {
    margin: 10,
    width: 100,
    height: 270,
  },
};
