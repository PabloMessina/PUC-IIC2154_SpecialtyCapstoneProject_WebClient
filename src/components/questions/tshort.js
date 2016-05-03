import React, { Component } from 'react';
import {
  FormGroup,
  FormControl,
} from 'react-bootstrap';

import compose, { QuestionPropTypes } from './question';


class TShort extends Component {

  static get propTypes() {
    return QuestionPropTypes;
  }

  static get defaultProps() {
    return { answer: [] };
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.onTextChange = this.onTextChange.bind(this);
  }

  onTextChange(e) {
    const { onAnswerChange } = this.props;
    e.preventDefault();
    return onAnswerChange([e.target.value]);
  }

  renderReader() {
    const { answer } = this.props;

    return (
      <div style={styles.container}>
        <form style={styles.form}>
          <FormGroup>
            <FormControl
              style={styles.input}
              type="text"
              placeholder="Your answer"
              value={answer[0]}
              onChange={this.onTextChange}
            />
          </FormGroup>
        </form>
      </div>
    );
  }

  render() {
    switch (this.props.mode) {
      case 'editor': return this.renderEditor();
      case 'responder': return this.renderResponder();
      case 'reader': return this.renderReader();
      default: return null;
    }
  }
}

const styles = {
  container: {
    marginTop: 15,
  },
  form: {

  },
};

export default compose(TShort);
