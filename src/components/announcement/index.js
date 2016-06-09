import React, { Component, PropTypes } from 'react';
import {
} from 'react-bootstrap';

import renderIf from 'render-if';
import moment from 'moment';

import RichEditor from '../rich-editor';

function formatDate(date) {
  return `${moment.utc(date).format('DD MMMM YYYY - hh:mm')}`;
}


export default class Login extends Component {

  static get propTypes() {
    return {
      subject: PropTypes.string,
      content: PropTypes.object,
      responsable: PropTypes.string,
      date: PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      responsable: '',
    };
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { subject, content, responsable, date } = this.props;
    return (
      <div>
        <div style={styles.header}>
          <h5 style={styles.subject}>
            {subject}
            {renderIf(responsable)(() =>
              <small> by {responsable}</small>
            )}
          </h5>
          <p>{formatDate(date)}</p>
        </div>
        <div style={styles.editorContainer}>
          <RichEditor
            style={styles.richEditor}
            content={content}
            readOnly
          />
        </div>
      </div>
    );
  }
}

const styles = {
  richEditor: {
    padding: 0,
    fontSize: 15,
    overflow: 'auto',
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
