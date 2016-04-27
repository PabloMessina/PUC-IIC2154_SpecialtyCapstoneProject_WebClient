import React, { Component } from 'react';

// import MultiChoice from './multi-choice';
// import TShort from './tshort';
// import TrueFalse from './true-false';
import NewQuestion from './new-question';


export default class Questions extends Component {

  constructor(props) {
    super(props);
    this.state = {
      buffer: { _id: 0, question: { text: '' }, fields: {}, tags: [] },
    };
    this.changeQuestion = this.changeQuestion.bind(this);
    this.changeFields = this.changeFields.bind(this);
  }

  changeQuestion(_id, question) {
    const buffer = this.state.buffer;
    buffer.question = question;
    this.setState({ buffer });
  }

  changeFields(_id, fields) {
    const buffer = this.state.buffer;
    buffer.fields = fields;
    this.setState({ buffer });
  }

  render() {
    const question = this.state.questions[0];
    const props = {
      _id: 0,
      tags: question.tags,
      permission: 'reader',
      changeQuestion: this.changeQuestion,
      changeFields: this.changeFields,
    };
    return (
      <div style={styles.container}>
        <NewQuestion {...props} />
      </div>
    );
  }
}

const styles = {
  container: {
    marginLeft: 200,
    marginTop: 100,
    width: 500,
  },
};
