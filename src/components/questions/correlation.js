import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import Title from './title.js';

export default class Correlation extends Component {

  static get propTypes() {
    return {
      collapsible: React.PropTypes.bool,
      open: React.PropTypes.bool,
      question: React.PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      collapsible: true,
      open: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      collapsible: this.props.collapsible,
      open: this.props.open,
    };
  }

  render() {
    const { _id, tags, fields } = this.props.question;
    return (
      <Panel
        style={styles.container}
        header={
          <Title
            value={`Question ${_id}`}
            tags={tags}
            onClick={() => this.setState({ open: !this.state.open })}
          />
        }
        collapsible={this.props.collapsible}
        expanded={this.state.open}
      >
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
