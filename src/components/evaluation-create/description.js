import React, { Component } from 'react';
import {
  Row,
  Col,
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  Alert,
} from 'react-bootstrap';


export default class MinTemplate extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
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

              <FormGroup controlId="attendance">
                <ControlLabel>Attendance</ControlLabel>
                <FormControl componentClass="select" placeholder="select">
                  <option value="none">Not required</option>
                  <option value="optional">Optional attendance</option>
                  <option value="obligatory">Obligatory attendance</option>
                </FormControl>
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
