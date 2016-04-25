import React, { Component } from 'react';
import {
  Row,
  Col,
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

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      attendance: 0,
      public: true,
    };
  }

  render() {
    return (
      <div style={styles.container}>
        <Row>
          <Col xs={12}>
            <form onSubmit={this.onSubmit}>

              <FormGroup controlId="title">
                <ControlLabel>Title</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.title}
                  placeholder="Mid-term evaluation"
                  label="Title"
                  onChange={e => this.setState({ title: e.target.value })}
                />
                <FormControl.Feedback />
              </FormGroup>

              <FormGroup controlId="description">
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={this.state.description}
                  placeholder="Evaluation description..."
                  onChange={e => this.setState({ description: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Attendance restriction</ControlLabel>
                {ATTENDANCES.map((sub, i) => (
                  <Radio
                    key={i}
                    checked={this.state.attendance === i}
                    onChange={() => this.setState({ attendance: i })}
                  >
                    {sub.name}
                  </Radio>)
                )}
                <HelpBlock>{ATTENDANCES[this.state.attendance].description}</HelpBlock>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Visibility</ControlLabel>
                <Checkbox checked={this.state.public} onChange={() => this.setState({ public: !this.state.public })}>
                  Public evaluation
                </Checkbox>
                <HelpBlock>{this.state.public ? PRIVACY.PUBLIC : PRIVACY.PRIVATE}</HelpBlock>
              </FormGroup>

            </form>
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
