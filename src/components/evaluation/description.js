import React, { PropTypes, Component } from 'react';
import {
  Row,
  ControlLabel,
  Col,
  FormControl,
  Radio,
  Panel,
  HelpBlock,
  Button,
  FormGroup,
  Checkbox,
  Tabs,
  Tab,
  Alert,
} from 'react-bootstrap';
import Select from 'react-select';
import renderIf from 'render-if';
import moment from 'moment';

import app from '../../app';
const evaluationService = app.service('/evaluations');

// import { Colors } from '../../styles';

const FORMATS = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm',
};

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
  PUBLIC: `This evaluation will be scheduled as soon as posible to all the participant students,
but they will not be able to see the questions inside it until it officially starts.`,
};

const STATUS = {
  NONE: 'NONE',
  SAVING: 'SAVING',
  SAVED: 'SAVED',
};

function parseEvaluation({ startAt, finishAt, duration }) {
  const start = moment(startAt);
  const finish = finishAt ? moment(finishAt) : null;
  const durationTime = Math.floor(moment.duration(duration || 0).asHours()) + moment.utc(duration || 0).format(':mm');
  return {
    startDate: start.format(FORMATS.DATE),
    startTime: start.format(FORMATS.TIME),
    finishDate: finish ? finish.format(FORMATS.DATE) : '',
    finishTime: finish ? finish.format(FORMATS.TIME) : '',
    durationTime: durationTime.length >= '00:00'.length ? durationTime : `0${durationTime}`,
  };
}

export default class EvaluationDescription extends Component {

  static get propTypes() {
    return {
      organization: PropTypes.object,
      participant: PropTypes.object,
      course: PropTypes.object,
      evaluation: PropTypes.object,
      onEvaluationChange: PropTypes.func,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      // Current evaluation
      evaluation: props.evaluation,
      ...parseEvaluation(props.evaluation),
      // Other evaluations
      evaluations: [],
      checked: this.props.evaluation.discount !== 0,
      status: STATUS.NONE,
      error: null,
    };
    this.onChange = this.onChange.bind(this);
    // this.onDateChange = this.onDateChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    // this.onTagChange = this.onTagChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const evaluation = nextProps.evaluation;
    if (evaluation) this.setState({ evaluation, ...parseEvaluation(evaluation) });
  }

  onChange(field, value) {
    const evaluation = { ...this.state.evaluation, [field]: value };
    this.setState({ evaluation });
  }

  // onDateChange(field, original, value, fields, format) {
  //   const input = moment(value, format);
  //   const date = input.isValid() ? input : moment(new Date());
  //
  //   const keys = {};
  //   fields.forEach(key => (keys[key] = date.get(key)));
  //
  //   const final = (original || moment()).set(keys);
  //   this.onChange(field, final.format());
  // }

  onSubmit(e) {
    e.preventDefault();
    this.setState({ status: STATUS.SAVING });

    const startDate = moment(this.state.startDate, FORMATS.DATE);
    const startTime = moment(this.state.startTime, FORMATS.TIME);
    const startAt = moment(this.state.evaluation.startAt || new Date()).set({
      year: startDate.get('year'),
      month: startDate.get('month'),
      day: startDate.get('day'),
      hour: startTime.get('hour'),
      minute: startTime.get('minute'),
    });
    const finishDate = moment(this.state.finishDate, FORMATS.DATE);
    const finishTime = moment(this.state.finishTime, FORMATS.TIME);
    const finishAt = moment(this.state.evaluation.finishAt || new Date()).set({
      year: finishDate.get('year'),
      month: finishDate.get('month'),
      day: finishDate.get('day'),
      hour: finishTime.get('hour'),
      minute: finishTime.get('minute'),
    });

    const durationTime = moment(this.state.durationTime, FORMATS.TIME);
    const duration = (durationTime.get('hour') * 3600 + durationTime.get('minute') * 60) * 1000;

    return evaluationService
      .patch(this.state.evaluation.id, { ...this.state.evaluation, startAt, finishAt, duration, id: undefined })
      .then(evaluation => {
        this.setState({ evaluation, error: null, status: STATUS.SAVED });
        if (this.props.onEvaluationChange) this.props.onEvaluationChange(evaluation);
      })
      .catch(error => this.setState({ error, status: STATUS.NONE }));
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

  fetchOtherEvaluations(instance) {
    const query = {
      instanceId: instance.id || instance,
    };
    return evaluationService.find({ query })
      .then(result => result.data)
      .then(evaluations => this.setState({ evaluations, error: null }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const {
      title,
      description,
      attendance,
      surprise,
      // published,
      // groups,
      discount,
      randomized,
      tag,
      threshold,
    } = this.state.evaluation;
    const status = this.state.status;
    const level = ATTENDANCES.find(a => a.value === attendance) || ATTENDANCES[0];
    const tags = this.state.evaluations.filter(e => e.tag && e.tag.length).map(e => ({
      label: e.tag,
      value: e.tag,
    }));

    const {
      startDate,
      startTime,
      finishDate,
      finishTime,
      durationTime,
    } = this.state;

    const canEdit = ['admin', 'write'].includes(this.props.participant.permission);
    const disabled = !canEdit;

    return (
      <div style={styles.container}>
        <Row>
          <form onSubmit={this.onSubmit} style={styles.form}>
            <Col xsOffset={0} xs={12} smOffset={1} sm={7}>

              <FormGroup controlId="title">
                <ControlLabel>Title</ControlLabel>
                <FormControl
                  type="text"
                  value={title}
                  placeholder="Mid-term evaluation"
                  label="Title"
                  disabled={disabled}
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
                  disabled={disabled}
                  onChange={e => this.onChange('description', e.target.value)}
                />
              </FormGroup>

              <FormGroup controlId="tag">
                <ControlLabel>Tag</ControlLabel>
                <Select
                  simpleValue={false}
                  value={tag}
                  options={tags}
                  onChange={value => this.onChange('tag', value)}
                  onBlur={e => this.onChange('tag', e.target.value)}
                  disabled={disabled}
                  allowCreate
                  addLabelText="Create the tag: {label}"
                  placeholder="Evaluation tag..."
                  noResultsText="Type a new tag to create it"
                />
                <HelpBlock>
                  Here you can put the category of the evaluation.
                </HelpBlock>
              </FormGroup>

              <Tabs defaultActiveKey={0} id="evaluation-settings-tabs">

                <Tab style={styles.tab} eventKey={0} title="Timeline">
                  <FormGroup controlId="start">
                    <ControlLabel>Start at</ControlLabel>
                    <div style={styles.inline}>
                      <FormControl
                        style={{ marginRight: 15 }}
                        type="date"
                        value={startDate}
                        onChange={e => this.setState({ startDate: e.target.value })}
                        disabled={disabled}
                      />
                      <FormControl
                        style={{ marginLeft: 15 }}
                        type="time"
                        value={startTime}
                        onChange={e => this.setState({ startTime: e.target.value })}
                        disabled={disabled}
                      />
                    </div>
                    <HelpBlock>The students will be able to open this evaluation at this date and time.</HelpBlock>
                  </FormGroup>

                  <FormGroup>
                    <ControlLabel>Evaluation duration</ControlLabel>
                    <FormControl
                      type="time"
                      placeholder="1:30"
                      value={durationTime}
                      onChange={e => this.setState({ durationTime: e.target.value })}
                      disabled={disabled}
                    />
                    <HelpBlock>
                      Once a student starts his evaluation, he has this time to finish it.
                      After that, he can't update his answers anymore.
                    </HelpBlock>
                  </FormGroup>

                  <FormGroup controlId="end">
                    <ControlLabel>Finish at</ControlLabel>
                    <div style={styles.inline}>
                      <FormControl
                        style={{ marginRight: 15 }}
                        type="date"
                        value={finishDate}
                        onChange={e => this.setState({ finishDate: e.target.value })}
                        disabled={disabled}
                      />
                      <FormControl
                        style={{ marginLeft: 15 }}
                        type="time"
                        value={finishTime}
                        onChange={e => this.setState({ finishTime: e.target.value })}
                        disabled={disabled}
                      />
                    </div>
                    <HelpBlock>After this deadline, students will not be able to update their answers.</HelpBlock>
                  </FormGroup>
                </Tab>

                <Tab style={styles.tab} eventKey={1} title="Attendance">
                  <FormGroup>
                    <ControlLabel>Attendance restriction</ControlLabel>
                    {ATTENDANCES.map((sub, i) =>
                      <Radio
                        key={i}
                        checked={level.value === sub.value}
                        onChange={() => this.onChange('attendance', sub.value)}
                        disabled={disabled}
                      >
                        <strong>{sub.name}: </strong> <small>{sub.description}</small>
                      </Radio>
                    )}
                    <HelpBlock>The attendance list is on the <em>Student</em> tab.</HelpBlock>
                  </FormGroup>
                </Tab>

                <Tab style={styles.tab} eventKey={2} title="Score">
                  <FormGroup>
                    <ControlLabel>Discount score on wrong answers</ControlLabel>
                    <FormControl
                      type="number"
                      disabled={disabled}
                      value={discount || undefined}
                      placeholder="0"
                      min="0"
                      step="0.25"
                      label="Discount"
                      onChange={e => this.onChange('discount', e.target.value)}
                    />
                    <HelpBlock>Example: 0.25 will substract 0.25 off the total score for each bad answer</HelpBlock>
                  </FormGroup>

                  <FormGroup>
                    <ControlLabel>Threshold</ControlLabel>
                    <FormControl
                      type="number"
                      value={threshold}
                      placeholder="0.5"
                      disabled={disabled}
                      min="0"
                      max="1"
                      step="0.10"
                      label="Discount"
                      onChange={e => this.onChange('threshold', e.target.value)}
                    />
                    <HelpBlock>
                      Determinates the percentage of correct answers to score the half of the total points.
                    </HelpBlock>
                  </FormGroup>
                </Tab>

                <Tab style={styles.tab} eventKey={3} title="Visibility">
                  <FormGroup>
                    <ControlLabel>Randomized evaluation</ControlLabel>
                    <Checkbox
                      checked={randomized}
                      disabled={disabled}
                      onChange={() => this.onChange('randomized', !randomized)}
                    >
                      Each student should have different question order.
                    </Checkbox>
                    <HelpBlock>This can reduce cheating if enabled.</HelpBlock>
                  </FormGroup>

                  <FormGroup>
                    <ControlLabel>Before it starts, should appear as:</ControlLabel>
                    <Radio
                      checked={surprise}
                      onChange={() => this.onChange('secret', true)}
                      disabled={disabled}
                    >
                      <strong>Secret or surprise</strong>
                      <br />
                      <small>{PRIVACY.PRIVATE}</small>
                    </Radio>
                    <Radio
                      checked={!surprise}
                      onChange={() => this.onChange('secret', false)}
                      disabled={disabled}
                    >
                      <strong>Visible</strong>
                      <br />
                      <small>{PRIVACY.PUBLIC}</small>
                    </Radio>
                  </FormGroup>
                </Tab>

              </Tabs>
            </Col>

            <Col xsOffset={0} xs={12} sm={3}>
              <Panel>
                <h4>Evaluation settings</h4>
                <p>Make sure to setup the evaluation with the correct parameters</p>
                <hr />
                {renderIf(canEdit)(() =>
                  <div>
                    <Button block disabled={status === STATUS.SAVING} bsStyle="primary" type="submit">
                      {(() => {
                        switch (status) {
                          case STATUS.SAVING: return 'Saving...';
                          case STATUS.SAVED: return 'Saved';
                          default: return 'Save';
                        }
                      })()}
                    </Button>
                    {renderIf(this.state.error)(() =>
                      <Alert style={styles.error} bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
                        <p>{this.state.error.message}</p>
                      </Alert>
                    )}
                  </div>
                )}
              </Panel>
            </Col>

          </form>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {

  },
  tab: {
    padding: 15,
  },
  form: {

  },
  inline: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  error: {
    marginTop: 10,
  },
};
