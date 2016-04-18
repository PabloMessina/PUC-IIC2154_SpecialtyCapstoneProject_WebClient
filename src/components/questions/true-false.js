import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import Title from './title.js';

import { Colors } from '../../styles';

export default class TrueFalse extends Component {

  static get propTypes() {
    return {
      answer: React.PropTypes.bool,
      question: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      answer: true,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      answer: this.props.question.fields.answer ?
      this.props.question.fields.answer : this.props.answer,
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick(value) {
    this.setState({ answer: value });
  }
  render() {
    const { _id, tags, question } = this.props.question;
    return (
      <Panel style={styles.container} header={<Title number={_id} tags={tags} />}>
        <div>
          <p>{question.text}</p>
          <div style={styles.buttons}>
            <Button
              bsStyle="default"
              style={this.state.answer ? styles.buttonTrue : styles.button}
              onClick={() => this.onClick(true)}
            >
              True
            </Button>
            <Button
              bsStyle="default"
              style={this.state.answer ? styles.button : styles.buttonFalse}
              onClick={() => this.onClick(false)}
            >
              False
            </Button>
          </div>
        </div>
      </Panel>
    );
  }
}

const styles = {
  container: {
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    // backgroundColor: Colors.GRAY,
  },
  buttonTrue: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
  },
  buttonFalse: {
    backgroundColor: Colors.RED,
    color: Colors.WHITE,
  },
};
