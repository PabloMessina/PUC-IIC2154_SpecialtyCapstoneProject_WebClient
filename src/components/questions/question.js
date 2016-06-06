import React, { Component } from 'react';
import { FormGroup } from 'react-bootstrap';
import renderIf from 'render-if';
import RichEditor from '../rich-editor';

export const QuestionPropTypes = {
  style: React.PropTypes.object,
  question: React.PropTypes.object,
  fields: React.PropTypes.object,
  answer: React.PropTypes.any,
  identifier: React.PropTypes.any,
  mode: React.PropTypes.string,
  showType: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  padding: React.PropTypes.number,
  onAnswerChange: React.PropTypes.func,
  onFieldsChange: React.PropTypes.func,
  onBodyChange: React.PropTypes.func,
};

const QTYPE = {
  trueFalse: 'True/False',
  multiChoice: 'Multi-choice',
  tshort: 'Short text',
};

const MODES = [
  'reader',
  'responder',
  'editor',
];

export default function compose(ComposedComponent) {
  return class Question extends Component {
    static get propTypes() {
      return QuestionPropTypes;
    }

    static get defaultProps() {
      return { showType: true, mode: MODES[0], padding: 20, disabled: false };
    }

    constructor(props) {
      super(props);
      this.state = {};
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
      const customProps = {
        ...props,
        answer: question.answer,
        fields: question.fields,
      };
      const pad = { paddingLeft: padding, paddingRight: padding };
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
                {/* <FormControl
                  componentClass="textarea"
                  value={question.content.insert}
                  placeholder="Question body"
                  onChange={e => this.props.onBodyChange({ insert: e.target.value })}
                /> */}
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
                  // <p key={i}>{content.insert || content}</p>
                ))}
              </div>
            )}

            {/* Render specific content */}
            <div style={{ ...pad, ...styles.component }}>
              <ComposedComponent {...customProps} question={question} mode={mode} />
            </div>

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
    marginTop: 2,
    marginBottom: 0,
  },
  component: {

  },
  qtype: {
    color: 'gray',
  },
  identifier: {
    marginRight: 15,
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
