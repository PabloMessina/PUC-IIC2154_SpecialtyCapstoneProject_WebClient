import React, { Component } from 'react';
import { Panel, Input, ButtonInput } from 'react-bootstrap';
import Title from './title.js';
import renderIf from 'render-if';

export default class TShort extends Component {

  constructor(props) {
    super(props);

    let answers = [''];
    if (props.answers && props.question.fields.answers) {
      answers = this.props.question.fields.answers;
    }

    this.state = {
      answers,
    };

    this.onChange = this.onChange.bind(this);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  onChange(e, index) {
    // const answers = this.state.answers.splice(index, 1, e.target.value);
    const answers = [...this.state.answers];
    answers[index] = e.target.value;
    this.setState({ answers });
  }

  addItem(e) {
    e.preventDefault();
    const answers = this.state.answers;
    const last = answers[answers.length - 1];
    if (last && last.length > 0) {
      this.setState({ answers: [...answers, ''] });
    }
  }

  removeItem(e, index) {
    e.preventDefault();
    const answers = [...this.state.answers];
    answers[index] = '';
    if (answers.length > 1) {
      answers.splice(index, 1);
    }
    this.setState({ answers });
  }

  render() {
    const { _id, tags, fields } = this.props.question;
    return (
        <Panel style={styles.container} header={<Title number={_id} tags={tags} />}>
          <div>
            <p>{this.props.question.question.text}</p>
            <div style={styles.row}>
              <form style={styles.form}>
                {this.state.answers.map((answer, i, arr) => (
                  <div style={styles.row}>
                    <Input
                      key={i}
                      style={styles.input}
                      type="text"
                      placeholder="Ingrese su respuesta"
                      value={answer}
                      autoFocus={arr.length - 1 === i}
                      onChange={e => this.onChange(e, i)}
                      disabled={this.props.static}
                    />
                    {renderIf(i > 0)(() => (
                      <ButtonInput
                        style={[styles.button, styles.remove]}
                        bsStyle="link"
                        bsSize="large"
                        onClick={e => this.removeItem(e, i)}
                      >
                        -
                      </ButtonInput>
                    ))}
                  </div>
                ))}
                <ButtonInput style={[styles.button, styles.add]} bsStyle="link" type="submit" value="Agregar respuesta" onClick={this.addItem} />
              </form>
            </div>
          </div>
        </Panel>
    );
  }
}

TShort.propTypes = {
  question: React.PropTypes.any,
  answers: React.PropTypes.bool,
  static: React.PropTypes.bool,
};

TShort.defaultProps = {
  answers: false,
  static: false,
};

const styles = {
  container: {
  },
  title: {
    fontSize: 18,
    margin: 0,
  },
  form: {
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
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  input: {
    alignSelf: 'center',
    margin: 0,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  button: {
    textDecoration: 'none',
  },
  add: {

  },
  remove: {

  },
};
