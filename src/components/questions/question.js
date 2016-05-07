import React, { Component } from 'react';
import renderIf from 'render-if';

export const QuestionPropTypes = {
  question: React.PropTypes.object,
  style: React.PropTypes.object,
  answer: React.PropTypes.any,
  identifier: React.PropTypes.any,
  mode: React.PropTypes.string,
  showType: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  padding: React.PropTypes.number,
  onAnswerChange: React.PropTypes.func,
  onFieldsChange: React.PropTypes.func,
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
      const { question, identifier, style, showType, padding, ...props } = this.props;

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
            <div style={styles.texts}>
              {contents.map((content, i) => (
                <p key={i}>{content.insert || content}</p>
              ))}
            </div>

            {/* Render specific content */}
            <div style={{ ...pad, ...styles.component }}>
              <ComposedComponent {...props} question={question} />
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
};
