import React, { Component } from 'react';
import {
  Row,
  ControlLabel,
  Col,
  FormControl,
  InputGroup,
  Panel,
  HelpBlock,
  Button,
  FormGroup,
} from 'react-bootstrap';


import renderIf from 'render-if';
import app from '../../app';

const instanceService = app.service('/instances');
import { withRouter } from 'react-router';


class InstanceCreate extends Component {

  static get propTypes() {
    return {
      // From parent
      organization: React.PropTypes.object,
      course: React.PropTypes.object,
      router: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      period: '',
      minGrade: 0,
      maxGrade: 100,
      approvalGrade: 50,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const courseId = this.props.course.id;
    const data = {
      courseId,
      period: this.state.period,
      minGrade: this.state.minGrade,
      maxGrade: this.state.maxGrade,
      approvalGrade: this.state.approvalGrade,
    };
    return instanceService.create(data)
      .then(instance => this.props.router.push(`/courses/show/${courseId}/instances/show/${instance.id}`))
      .catch(error => this.setState({ submiting: false, error }));
  }

  onChange(field, value) {
    this.setState({ [field]: value });
  }

  render() {
    return (
      <div style={styles.container}>
        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={7}>
            <form onSubmit={this.onSubmit} style={styles.form}>

              <FormGroup controlId="title">
                <ControlLabel>Period</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.period}
                  placeholder="Summer 2016, Fall 2016"
                  onChange={e => this.onChange('period', e.target.value)}
                />
                <FormControl.Feedback />
              </FormGroup>
              <Row>
                <Col sm={4}>
                  <FormGroup>
                    <ControlLabel>Min Grade</ControlLabel>
                    <InputGroup>

                      <FormControl
                        type="number"
                        value={this.state.minGrade}
                        placeholder="1"
                        min="0"
                        label="Discount"
                        onChange={e => this.onChange('minGrade', e.target.value)}
                      />
                    </InputGroup>
                    <HelpBlock>
                      Minimum grade.
                    </HelpBlock>
                  </FormGroup>
                </Col>
                <Col sm={4}>
                  <FormGroup>
                    <ControlLabel>Approval Grade</ControlLabel>
                    <InputGroup>

                      <FormControl
                        type="number"
                        value={this.state.approvalGrade}
                        placeholder="1"
                        min="0"
                        label="Discount"
                        onChange={e => this.onChange('approvalGrade', e.target.value)}
                      />
                    </InputGroup>
                    <HelpBlock>
                      Grade to approve.
                    </HelpBlock>
                  </FormGroup>
                </Col>
                <Col sm={4}>
                  <FormGroup>
                    <ControlLabel>Max Grade</ControlLabel>
                    <InputGroup>

                      <FormControl
                        type="number"
                        value={this.state.maxGrade}
                        placeholder="1"
                        min="0"
                        label="Discount"
                        onChange={e => this.onChange('maxGrade', e.target.value)}
                      />
                    </InputGroup>
                    <HelpBlock>
                      Maximum grade.
                    </HelpBlock>
                  </FormGroup>
                </Col>
              </Row>

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
              <h4>Instance Edit</h4>
              <p>Make sure to setup the instance with the correct parameters</p>
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

export default withRouter(InstanceCreate);
