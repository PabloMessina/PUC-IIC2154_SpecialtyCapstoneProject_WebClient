import React, { Component } from 'react';
import {
  Row,
  Col,
  Panel,
  Radio,
  Checkbox,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock,
} from 'react-bootstrap';


const ATTENDANCES = [
  {
    value: 'none',
    name: 'Not required',
    description: 'Do not take assistance.',
  },
  {
    value: 'optional',
    name: 'Optional',
    description: 'Can take attendance, but it has no effect.',
  },
  {
    value: 'obligatory',
    name: 'Obligatory',
    description: 'Ausent students will fail this evaluation.',
  },
];

const PRIVACY = {
  PRIVATE: 'This is a secret evaluation.',
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
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      attendance: ATTENDANCES[0].value,
      isPublic: true,
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(field, value) {
    const evaluation = { [field]: value };
    if (this.props.onEvaluationChange) this.props.onEvaluationChange(evaluation);
  }

  render() {
    const { title, description, attendance, isPublic } = this.props.evaluation;

    const mode = ATTENDANCES.find(a => a.value === attendance) || ATTENDANCES[0];

    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12} sm={9}>
            <form onSubmit={this.onSubmit}>

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
                <ControlLabel>Visibility</ControlLabel>
                <Checkbox checked={isPublic} onChange={() => this.onChange('isPublic', !isPublic)}>
                  Public evaluation
                </Checkbox>
                <HelpBlock>{isPublic ? PRIVACY.PUBLIC : PRIVACY.PRIVATE}</HelpBlock>
              </FormGroup>

            </form>
          </Col>
          <Col xs={12} sm={3}>
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
};
