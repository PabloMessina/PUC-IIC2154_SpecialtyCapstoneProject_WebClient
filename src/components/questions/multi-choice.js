import React, { Component } from 'react';
import { Panel, Input } from 'react-bootstrap';
import Title from './title.js';

export default class MultiChoice extends Component {

  constructor(props) {
    super(props);
    this.state = {
      checked: new Array(props.question.fields.choices),
    };
    this.check = this.check.bind(this);
  }

  check() {
    this.setState({ checked: !this.state.checked });
  }

  render() {
    const { _id, tags, fields } = this.props.question;
    return (
        <Panel style={styles.container} header={<Title number={_id} tags={tags} />}>
          <div>
            <p>{this.props.question.question.text}</p>
            <div style={styles.body}>
              <div style={styles.column}>
              <form>
                {fields.choices.map((choice, i) => (
                  <Input
                    key={i}
                    type="checkbox"
                    label={choice.text}
                    checked={this.state.checked[i]}
                    onChange={this.check}
                  />
                ))}
                </form>
              </div>
            </div>
          </div>
        </Panel>
    );
  }
}

MultiChoice.propTypes = {
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
    justifyContent: 'flex-start',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
};
