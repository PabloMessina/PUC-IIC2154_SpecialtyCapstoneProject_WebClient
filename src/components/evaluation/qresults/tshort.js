import React, { PropTypes, Component } from 'react';
import Chart from 'chart.js';
import { Colors } from '../../../styles';

import { transform, correction } from '../../../utils/correction';

export default class TShort extends Component {

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

    let data = answers.map(ans => transform(ans.answer.options[0]))
      .reduce((last, current) => {
        const array = { ...last };
        if (array[current]) {
          array[current] += 1;
        } else {
          array[current] = 1;
        }
        return array;
      }, {});

    const labels = Object.keys(data);
    data = labels.map(label => data[label]);

    const graph = {
      labels,
      datasets: [{
        data,
        label: '',
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
                labelString: 'answers',
              },
            }],
          },
        },
      });
    }

    const events = {
      hover: () => true,
      mousemove: () => true,
      mouseout: () => true,
      click: () => true,
      touchstart: () => true,
      touchmove: () => true,
      touchend: () => true,
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
