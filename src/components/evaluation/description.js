import React, { Component } from 'react';
import {
  Row,
  ControlLabel,
  Col,
  FormControl,
  Radio,
  InputGroup,
  Panel,
  HelpBlock,
  Button,
  FormGroup,
  Checkbox,
} from 'react-bootstrap';

import { Colors } from '../../styles';
import Select from 'react-select';
import renderIf from 'render-if';

const ATTENDANCES = [{
  value: 'none',
  name: 'Not required',
  description: 'Do not take assistance.',
}, {
  value: 'optional',
  name: 'Optional',
  description: 'Can take attendance, but it has no effect.',
}, {
  value: 'obligatory',
  name: 'Obligatory',
  description: 'Ausent students will fail this evaluation.',
}];

const PRIVACY = {
  PRIVATE: 'This is a secret evaluation. Will only appear to the students once it starts.',
  PUBLIC: `This evaluation will be scheduled as soon as posible to all the participan students,
but they will not be able to see the questions inside it.`,
};

export default class MinTemplate extends Component {

  static get propTypes() {
    return {
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      evaluation: React.PropTypes.object,
      onEvaluationChange: React.PropTypes.func,
      onSubmitDescription: React.PropTypes.func,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.evaluation.discount !== 0,
      tag: '',
      options: [
        { label: 'Exam', value: 'Exam' },
        { label: 'Test', value: 'Test' },
        { label: 'Quiz', value: 'Quiz' },
      ],
      saved: '',
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onTagChange = this.onTagChange.bind(this);
  }

  onTagChange(value, tag) {
    this.setState({ tag });
    this.onChange('tag', value);
  }

  onChange(field, value) {
    const evaluation = { [field]: value };
    if (this.props.onEvaluationChange) this.props.onEvaluationChange(evaluation);
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.props.onSubmitDescription) this.props.onSubmitDescription();
    this.setState({ saved: 'Evaluation saved!' });
  }

  discountMessage(discount) {
    if (discount < 0.0) {
      return 'Invalid discount value';
    } else if (discount > 0.0 && discount <= 1.0) {
      return `Each ${(1 / discount).toFixed(2)} incorrect answers will cancel the score of 1 good answer.`;
    } else if (discount > 1.0) {
      return `Each incorrect answers will cancel the score of ${discount} good answer.`;
    } else {
      return 'No discount will apply.';
    }
  }

  render() {
    const {
      title,
      description,
      attendance,
      secret,
      discount,
      randomized,
      tag,
      threshold,
      // startAt,
      // finishAt,
    } = this.props.evaluation;
    const mode = ATTENDANCES.find(a => a.value === attendance) || ATTENDANCES[0];

    return (
      <div style={styles.container}>
        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={7}>
            <form onSubmit={this.onSubmit} style={styles.form}>

              <FormGroup controlId="title">
                <ControlLabel>Title</ControlLabel>
                <FormControl
                  type="text"
                  value={title}
                  placeholder="Mid-term evaluation"
                  label="Title"
                  onChange={e => this.onChange('title', e.target.value)}
                />
                <FormControl.Feedback />
              </FormGroup>

              <FormGroup controlId="description">
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={description}
                  placeholder="Evaluation description..."
                  onChange={e => this.onChange('description', e.target.value)}
                />
              </FormGroup>

              <FormGroup controlId="tag">
                <ControlLabel>Tag</ControlLabel>
                <Select
                  simpleValue={false}
                  disabled={false}
                  allowCreate
                  addLabelText={'Create the tag: {label}'}
                  value={tag}
                  options={this.state.options}
                  onChange={this.onTagChange}
                  placeholder={'Exam, Test, Quiz'}
                />
                <HelpBlock>
                  Here you can put the category of the evaluation.
                </HelpBlock>
              </FormGroup>

              <hr />

              <FormGroup>
                <ControlLabel>Attendance restriction</ControlLabel>
                {ATTENDANCES.map((sub, i) => (
                  <Radio
                    key={i}
                    checked={mode.value === sub.value}
                    onChange={() => this.onChange('attendance', sub.value)}
                  >
                    {sub.name}
                  </Radio>)
                )}
                <HelpBlock>{mode.description}</HelpBlock>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Discount score on wrong answers</ControlLabel>
                <InputGroup>

                  <InputGroup.Addon>
                    <input
                      type="checkbox"
                      checked={this.state.checked}
                      onChange={() => {
                        const checked = !this.state.checked;
                        this.setState({ checked });
                        this.onChange('discount', checked ? discount : 0);
                      }}
                      aria-label="check-discount"
                    />
                  </InputGroup.Addon>

                  <FormControl
                    type="number"
                    disabled={!this.state.checked}
                    value={discount || undefined}
                    placeholder="0.25"
                    min="0"
                    step="0.25"
                    label="Discount"
                    onChange={e => this.onChange('discount', this.state.checked ? e.target.value : 0)}
                  />
                </InputGroup>
                <HelpBlock>{this.discountMessage(this.state.checked ? discount : 0)}</HelpBlock>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Threshold</ControlLabel>
                <InputGroup>

                  <FormControl
                    type="number"
                    value={threshold}
                    placeholder="0.5"
                    min="0"
                    max="1"
                    step="0.25"
                    label="Discount"
                    onChange={e => this.onChange('threshold', e.target.value)}
                  />
                </InputGroup>
                <HelpBlock>
                  Determinates the percentage of correct answers to score the half of the total points.
                </HelpBlock>
              </FormGroup>

              <hr />

              <FormGroup>
                <ControlLabel>Randomized evaluation</ControlLabel>
                <Checkbox checked={randomized} onChange={() => this.onChange('randomized', !randomized)}>
                  Each student should have different question order.
                </Checkbox>
                <HelpBlock>This can reduce cheating if enabled.</HelpBlock>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Visibility</ControlLabel>
                <Checkbox checked={secret} onChange={() => this.onChange('secret', !secret)}>
                  Secret or surprise evaluation
                </Checkbox>
                <HelpBlock>{secret ? PRIVACY.PRIVATE : PRIVACY.PUBLIC}</HelpBlock>
              </FormGroup>
              <Button
                bsStyle="primary"
                type="submit"
                style={styles.submit}
              >
                Save
              </Button>
              {renderIf(this.state.saved !== '')(() =>
                <div>
                  <br />
                  <p bold style={styles.saved}>{this.state.saved}</p>
                </div>
              )}
            </form>
          </Col>
          <Col xsOffset={0} xs={12} sm={3}>
            <Panel>
              <h4>Evaluation settings</h4>
              <p>Make sure to setup the evaluation with the correct parameters</p>
              <hr />
              <p>Go to the next tab when you are ready</p>
            </Panel>
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {

  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  submit: {
    flex: 1,
    alignSelf: 'flex-start',
  },
  saved: {
    color: Colors.MAIN,
  },
};
