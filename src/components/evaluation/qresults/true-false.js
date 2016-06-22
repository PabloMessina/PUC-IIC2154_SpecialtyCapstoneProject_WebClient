import React, { PropTypes, Component } from 'react';
import Chart from 'chart.js';
import { Colors } from '../../../styles';

const COLORS = {
  RED: Colors.RED,
  GREEN: Colors.MAIN,
  GRAY: Colors.GRAY,
};

export default class TrueFalse extends Component {

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
    const data = answers
      .map(a => a.answer)
      .reduce((previous, current) => {
        const array = [...previous];
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

    const ctx = document.getElementById(question.id);
    if (ctx) {
      const myChart = new Chart(ctx, {
        type: 'pie',
        data: graph,
      });
    }

    return (
      <div styles={styles.container}>
        <canvas id={question.id} data-paper-resize style={styles.chart} />
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
