import React, { Component } from 'react';
import { Panel, Label, Col, Grid } from 'react-bootstrap';
import Title from './title.js';

export default class Correlation extends Component {

  constructor(props) {
    super(props);
  }


  render() {
    const { _id, tags, fields } = this.props.question;
    return (
      <Panel style={styles.container} header={<Title number={_id} tags={tags} />}>
        <div>
          <p>{this.props.question.question.text}</p>
          <div style={styles.body}>
            <div style={styles.column}>
              {fields.keys.map((key, i) => <p key={i}>{key.text}</p>)}
            </div>
            <div style={styles.column}>
              {fields.values.map((value, i) => <p key={i}>{value.text}</p>)}
            </div>
          </div>
        </div>
      </Panel>
    );
  }
}

Correlation.propTypes = {
  question: React.PropTypes.any,
};

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
