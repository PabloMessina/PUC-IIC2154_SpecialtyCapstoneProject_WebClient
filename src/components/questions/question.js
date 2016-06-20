import React, { Component, PropTypes } from 'react';
import { FormGroup } from 'react-bootstrap';
import renderIf from 'render-if';
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
  onAnswerChange: PropTypes.func,
  onFieldsChange: PropTypes.func,
  onFieldsAndAnswerChange: PropTypes.func,
  onBodyChange: PropTypes.func,
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
        // Set to undefined (if it's null) so the components can use defaultProps with this
        answer: question.answer || undefined,
        fields: question.fields || undefined,
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
    marginTop: 2,
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
