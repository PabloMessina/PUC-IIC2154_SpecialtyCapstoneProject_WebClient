import React, { Component } from 'react';
import { Panel, Input } from 'react-bootstrap';
import Title from './title.js';

export default class MultiChoice extends Component {

  static get defaultProps() {
    return {
      answers: false,
      static: false,
    };
  }

  static get propTypes() {
    return {
      question: React.PropTypes.object,
      checked: React.PropTypes.array,
      answers: React.PropTypes.bool,
      static: React.PropTypes.bool,
    };
  }

  constructor(props) {
    debugger;
    super(props);
    const checked = Array(this.props.question.fields.choices.length).fill(false);
    if (props.answers && props.question.fields.answers) {
      props.question.fields.answers.forEach(index => {
        checked[index] = true;
      });
    }

    this.state = {
      checked,
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
                    disabled={this.props.static}
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
