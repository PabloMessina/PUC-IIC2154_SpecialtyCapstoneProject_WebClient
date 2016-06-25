import React, { PropTypes, Component } from 'react';
import { FormGroup } from 'react-bootstrap';
import renderIf from 'render-if';
import debounce from 'lodash/debounce';

import RichEditor from '../rich-editor';

export const QuestionPropTypes = {
  style: PropTypes.object,
  question: PropTypes.object,
  fields: PropTypes.object,
  answer: PropTypes.any,
  identifier: PropTypes.any,
  mode: PropTypes.string,
  showType: PropTypes.bool,
  disabled: PropTypes.bool,
  padding: PropTypes.number,
  interval: PropTypes.number,
  onAnswerChange: PropTypes.func,
  onFieldsChange: PropTypes.func,
  onFieldsAndAnswerChange: PropTypes.func,
  onBodyChange: PropTypes.func,
};

const QTYPE = {
  trueFalse: 'True/False',
  multiChoice: 'Multi-choice',
  tshort: 'Short text',
  correlation: 'Correlation',
};

const MODES = [
  'reader',
  'responder',
  'editor',
];

const NOOP = () => {};

export default function compose(ComposedComponent) {
  return class Question extends Component {
    static propTypes = QuestionPropTypes
    static defaultProps = {
      showType: true,
      mode: MODES[0],
      padding: 20,
      disabled: false,
      interval: 3000,
      onAnswerChange: NOOP,
      onFieldsChange: NOOP,
      onBodyChange: NOOP,
    }

    static isAnswered = ComposedComponent.isAnswered

    constructor(props) {
      super(props);
      const { question, interval, onFieldsChange, onAnswerChange } = props;
      this.state = {
        answer: question.answer || undefined,
        fields: question.fields || undefined,
      };
      this.delayedAnswerChange = interval ? debounce(onAnswerChange, interval) : onAnswerChange;
      this.delayedFieldsChange = interval ? debounce(onFieldsChange, interval) : onFieldsChange;
    }

    componentWillReceiveProps = ({ question }) => {
      // Set to undefined if falsy (null can be dangerous)
      this.setState({
        answer: question.answer || undefined,
        fields: question.fields || undefined,
      });
    }

    onAnswerChange = (answer) => {
      this.setState({ answer });
      this.delayedAnswerChange(answer);
    }

    onFieldsChange = (fields) => {
      this.setState({ fields });
      this.delayedFieldsChange(fields);
    }

    render() {
      const {
        question,
        mode,
        identifier,
        style,
        showType,
        padding,
        onBodyChange,
        ...props,
      } = this.props;

      const { answer, fields } = this.state;

      const customProps = {
        ...props,
        answer,
        fields,
        onAnswerChange: this.onAnswerChange,
        onFieldsChange: this.onFieldsChange,
      };

      // Convert to array
      const contents = [].concat(question.content);

      return (
        <div style={{ ...styles.question, ...style }}>

          {/* Render question number or identifier */}
          {renderIf(identifier)(() => (
            <p style={{ ...styles.identifier, paddingTop: showType ? 20 : 0 }}>
              <strong>{identifier})</strong>
            </p>
          ))}

          <div style={styles.body}>

            {/* Show question type */}
            {renderIf(showType && question.qtype)(() => (
              <small style={styles.qtype}><em>{QTYPE[question.qtype]}</em></small>
            ))}

            {/* Render common question wording */}
            {renderIf(mode === 'editor')(() =>
              <FormGroup controlId="description" style={styles.description}>
                <RichEditor
                  style={styles.richEditor}
                  content={question.content}
                  onChange={onBodyChange}
                />
              </FormGroup>
            )}
            {renderIf(mode !== 'editor')(() =>
              <div style={styles.texts}>
                {contents.map((cont, i) => (
                  <RichEditor
                    key={i}
                    style={styles.richText}
                    content={question.content}
                    onChange={onBodyChange}
                    readOnly
                  />
                ))}
              </div>
            )}

            {/* Render specific content */}
            <div style={{ paddingLeft: padding, paddingRight: padding, ...styles.component }}>
              <ComposedComponent {...customProps} question={question} mode={mode} />
            </div>

            {renderIf(ComposedComponent.instructions && mode !== 'reader')(() =>
              <div style={styles.instructions}>
                <ComposedComponent.instructions />
              </div>
            )}

          </div>
        </div>
      );
    }
  };
}

const styles = {
  question: {
    display: 'flex',
    flexDirection: 'row',
    // backgroundColor: 'white',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  texts: {
    marginTop: 0,
    marginBottom: 0,
  },
  component: {

  },
  instructions: {
    paddingLeft: 20,
  },
  qtype: {
    color: 'gray',
  },
  identifier: {
    marginRight: 15,
    marginTop: 19,
  },
  richEditor: {
    padding: 50,
    fontSize: 15,
  },
  richText: {
    padding: 10,
    fontSize: 15,
  },
  description: {
    padding: 5,
  },
};
