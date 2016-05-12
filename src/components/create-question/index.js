import React, { Component, PropTypes } from 'react';
import {
  DropdownButton,
  MenuItem,
  Col,
  Row,
} from 'react-bootstrap';
import Select from 'react-select';

import { TrueFalse, MultiChoice, TShort } from '../questions';

const QUESTION_TYPES = {
  multiChoice: 'Multi choice',
  tshort: 'Short text',
  trueFalse: 'True - False',
};

const EMPTY_QUESTION = {
  id: 1,
  qtype: Object.keys(QUESTION_TYPES)[0],
  content: {
    insert: '¿Sed ut posuere velit?',
  },
  tags: [''],
};

function questionFactory(qtype, props) {
  switch (qtype) {
    case 'trueFalse': return <TrueFalse {...props} />;
    case 'multiChoice': return <MultiChoice {...props} />;
    case 'tshort': return <TShort {...props} />;
    default: return null;
  }
}

export default class CreateQuestion extends Component {

  static get propTypes() {
    return { question: PropTypes.object };
  }

  static get defaultProps() {
    return { question: EMPTY_QUESTION };
  }

  constructor(props) {
    super(props);
    this.state = {
      question: props.question,
      selected: [],
      tags: [
        { label: 'Tag 1', value: 'Tag 1' },
        { label: 'Tag 2', value: 'Tag 2' },
        { label: 'Tag 3', value: 'Tag 3' },
        { label: 'Tag 4', value: 'Tag 4' },
        { label: 'Tag 5', value: 'Tag 5' },
      ],
    };
    this.onTagChange = this.onTagChange.bind(this);
  }

  onTagChange(value, labels) {
    const tags = labels.map(l => l.value);
    this.setState({ selected: labels, question: { ...this.state.question, tags } });
  }

  getQuestion() {
    return this.state.question;
  }

  render() {
    const { question, selected, tags } = this.state;

    const element = questionFactory(question.qtype, {
      question,
      answer: question.answer,
      fields: question.fields,
      disabled: false,
      mode: 'editor',
      onAnswerChange: answer => this.setState({ question: { ...this.state.question, answer } }),
      onFieldsChange: fields => this.setState({ question: { ...this.state.question, fields } }),
      onBodyChange: content => this.setState({ question: { ...this.state.question, content } }),
    });

    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Col>
        </Row>
        <Row>
          <hr />
          <Col xs={12} style={styles.top}>
            <DropdownButton
              style={styles.button}
              bsStyle="default"
              title={QUESTION_TYPES[question.qtype]}
              onSelect={qtype =>
                this.setState({ question: { ...question, qtype, fields: undefined, answer: undefined } })
              }
              id="questiom-type-dropdown"
            >
              {Object.keys(QUESTION_TYPES).map(tag =>
                <MenuItem
                  key={tag}
                  eventKey={tag}
                  active={question.qtype === tag}
                >
                  {QUESTION_TYPES[tag]}
                </MenuItem>
              )}
            </DropdownButton>
            <div style={styles.select}>
              <Select
                multi
                simpleValue={false}
                value={selected}
                options={tags}
                onChange={this.onTagChange}
                placeholder={'Tags'}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <hr />
            {element}
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {

  },
  select: {
    flex: 1,
  },
  button: {
    marginRight: 5,
  },
  top: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
};
