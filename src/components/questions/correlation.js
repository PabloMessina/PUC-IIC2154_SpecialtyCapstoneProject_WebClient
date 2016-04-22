import React, { Component } from 'react';

export default class Correlation extends Component {

  static get propTypes() {
    return {
      _id: React.PropTypes.number,
      question: React.PropTypes.object,
      answers: React.PropTypes.array,
      keys: React.PropTypes.array,
      values: React.PropTypes.array,
      collapsible: React.PropTypes.bool,
      open: React.PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      _id: 0,
      question: { question: { text: '' }, fields: { answers: [], keys: [], values: [] } },
      answers: [],
      keys: [{ text: '' }],
      values: [{ text: '' }],
      collapsible: true,
      open: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      _id: props.question._id || props._id,
      question: props.question,
      answers: props.question.fields.answers.length ? props.question.fields.answers : props.answers,
      keys: props.question.fields.keys.length ? props.question.fields.keys : props.keys,
      values: props.question.fields.values.length ? props.question.fields.values : props.values,
      collapsible: props.collapsible,
      open: props.open,
    };
  }

  render() {
    return (
        <div>
          <p>{this.props.question.question.text}</p>
          <div style={styles.body}>
            <div style={styles.column}>
              {this.state.question.fields.keys.map((key, i) => <p key={i}>{key.text}</p>)}
            </div>
            <div style={styles.column}>
              {this.state.question.fields.values.map((value, i) => <p key={i}>{value.text}</p>)}
            </div>
          </div>
        </div>
    );
  }
}

const styles = {
  container: {
  },
  title: {
    fontSize: 18,
    margin: 0,
  },
  tag: {
    marginLeft: 3,
    marginRight: 3,
  },
  header: {
    padding: -5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
};
