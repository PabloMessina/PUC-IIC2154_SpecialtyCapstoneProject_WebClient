import React, {
  Component,
} from 'react';
import {
  Button,
} from 'react-bootstrap';

import MultiChoice from './multi-choice';
import TShort from './tshort';
import TrueFalse from './true-false';

import { Colors } from '../../styles';

const questionTypes = {
  multiChoice: 'Multi choice',
  tshort: 'Short text',
  trueFalse: 'True - False',
};

export default class NewQuestion extends Component {

  static get propTypes() {
    return {
      _id: React.PropTypes.number,
      typeQuestion: React.PropTypes.string,
      question: React.PropTypes.object,
      tags: React.PropTypes.array,
      fields: React.PropTypes.object,
      current: React.PropTypes.any,
      onSubmit: React.PropTypes.func,
      questionTypes: React.PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      _id: 0,
      typeQuestion: 'trueFalse',
      question: {},
      tags: [],
      fields: {},
      current: <TrueFalse permission={'editor'} title={'New Question'} />,
      questionTypes,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      _id: props._id,
      typeQuestion: props.typeQuestion,
      question: props.question,
      tags: props.tags,
      fields: props.fields,
      current: props.current,
    };
    this.changeQuestion = this.changeQuestion.bind(this);
    this.changeFields = this.changeFields.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const tags = nextProps.tags;
    const typeQuestion = nextProps.typeQuestion;
    if (tags && tags !== this.state.tags) {
      this.setState({ tags });
    }
    if (typeQuestion && typeQuestion !== this.state.typeQuestion) {
      this.setState({ typeQuestion });
    }
  }

  onSubmit() {
    const question = {
      _id: this.state._id,
      _type: this.state.typeQuestion,
      question: this.state.question,
      tags: this.state.tags,
      fields: this.state.fields,
    };
    this.props.onSubmit(question);
  }

  changeQuestion(id, question) {
    this.setState({ question });
  }

  changeFields(id, fields) {
    this.setState({ fields });
  }

  render() {
    return (
      <div>
        <hr />
        <div>
          <div style={styles.questionTitleTags}>
            <p style={styles.questionTypesTitle}>#{this.state._id} - {questionTypes[this.state.typeQuestion]}</p>
            <div style={styles.tagsContainer}>
              {this.state.tags.map((tag, j) =>
                <p key={j} style={styles.tag}>{tag}</p>
              )}
            </div>
          </div>
          {(() => {
            const props = {
              _id: this.state._id,
              question: this.state.question,
              permission: 'editor',
              changeQuestion: this.changeQuestion,
              changeFields: this.changeFields,
            };
            switch (this.state.typeQuestion) {
              case 'trueFalse': {
                props.fields = this.state.fields.answer
                  ? this.state.fields
                  : { answer: 0 };
                return (<TrueFalse {...props} />);
              }
              case 'multiChoice': {
                props.fields = this.state.fields.choices && this.state.fields.choices[0].text
                  ? this.state.fields
                  : { selectable: 1, choices: [{ text: '' }], answers: [] };
                return (<MultiChoice {...props} />);
              }
              case 'tshort': {
                props.fields = this.state.fields.answers && this.state.fields.answers[0]
                  ? this.state.fields
                  : { answers: [''] };
                return (<TShort {...props} />);
              }
              default: return null;
            }
          })()}
        </div>
        <div style={styles.submitContainer}>
          <Button style={styles.submit} onClick={this.onSubmit}>Submit</Button>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
  },
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    margin: 5,
  },
  submit: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
  },
  submitContainer: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  tag: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
    margin: 3,
    padding: 3,
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 5,
  },
  tagsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  questionTitleTags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionTypesTitle: {
    fontSize: 24,
  },
};
