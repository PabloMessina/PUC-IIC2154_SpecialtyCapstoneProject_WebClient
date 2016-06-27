import React, { Component, PropTypes } from 'react';
import Select from 'react-select';
import {
  Form,
  Button,
  Panel,
  Col,
  Row,
} from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';

import app from '../../../app';
const questionService = app.service('/questions');

import { TrueFalse, MultiChoice, TShort, Correlation } from '../../questions';
import CreateQuestionModal from '../../question-create/modal';

import { Colors } from '../../../styles';

function questionFactory(qtype, props) {
  switch (qtype) {
    case 'trueFalse': return <TrueFalse {...props} />;
    case 'multiChoice': return <MultiChoice {...props} />;
    case 'tshort': return <TShort {...props} />;
    case 'correlation': return <Correlation {...props} />;
    default: return null;
  }
}


export default class QuestionPool extends Component {

  static get propTypes() {
    return {
      mode: PropTypes.string,
      pool: PropTypes.array,
      selected: PropTypes.array,
      tags: PropTypes.array,
      hidden: PropTypes.array,
      participant: PropTypes.object,

      // Instructor mode
      answers: PropTypes.object,

      // Student mode
      evaluationQuestions: PropTypes.array,

      // From parent
      organization: PropTypes.object,
      evaluation: PropTypes.object,
      questions: PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      message: 'Template',
      selected: [],
      tags: [],
      pool: [],
      hidden: [],
      participant: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      // All tags
      tags: props.tags,
      // Selected tags
      selected: props.selected,
      // hidden questions
      hidden: props.hidden,
      // all the questions
      pool: props.pool,
      // is creating a new question
      creating: false,
      // is editing a question
      editing: false,
      // question that is being edited
      currentQuestion: undefined,
      // common error
      error: null,
    };

    this.fetchQuestions = this.fetchQuestions.bind(this);

    this.renderQuestion = this.renderQuestion.bind(this);
    this.renderQuestionPool = this.renderQuestionPool.bind(this);
    this.renderQuestionList = this.renderQuestionList.bind(this);

    this.onModalClose = this.onModalClose.bind(this);
    this.onModalSave = this.onModalSave.bind(this);
  }

  componentDidMount() {
    if (this.props.organization) this.fetchQuestions(this.props.organization.id);
    this.fetchTags();
  }

  onModalClose(/* question */) {
    this.setState({ creating: false, editing: false });
  }

  onModalSave(question) {
    const data = { ...question, id: undefined, organizationId: this.props.organization.id };
    return questionService.create(data)
      .then(created => { // eslint-disable-line
        this.setState({ creating: false, editing: false, error: null });
        // this.props.onQuestionAdd(created);
      })
      .catch(error => this.setState({ error }));
  }

  fetchTags() {
    const query = {
      organizationId: this.props.organization.id,
    };
    return questionService.find({ query })
      .then(result => result.data)
      .then(questions => [].concat.apply([], questions.map(q => q.tags)))
      .then(tags => tags.filter(t => t && t.length))
      .then(tags => [...new Set(tags)])
      .then(tags => tags.map(t => ({ label: t, value: t })))
      .then(tags => this.setState({ tags }));
  }


  fetchQuestions(organizationId) {
    const query = {
      organizationId,
    };
    return questionService.find({ query })
      .then(result => result.data)
      .then(questions => {
        this.setState({ pool: questions });
      });
  }

  renderQuestionList() {
    const { pool, selected } = this.state;
    const objects = pool
      .filter(question => selected.every(tag => question.tags.indexOf(tag.label) > -1))
      .map(question => ({
        question,
        qtype: question.qtype,
        disabled: true,
      }));
    return (
      <div>
        {objects.map((object, i) => (
          <div key={i} >
            {this.renderQuestion(object, i + 1)}
          </div>
        ))}
      </div>
    );
  }

  renderQuestion(props, identifier) {
    const question = props.question;
    const mode = 'reader';
    const element = questionFactory(question.qtype, {
      ...props,
      identifier,
      mode,
    });
    return (
      <div key={question.id} style={styles.question}>
        <hr />
        {element}
      </div>
    );
  }

  renderQuestionPool() {
    const { selected, tags } = this.state;

    return (
      <div>
        <Form style={styles.formQuestions}>
          <div style={styles.select}>
            <Select
              multi
              simpleValue={false}
              value={selected}
              options={tags}
              onChange={(value, labels) => this.setState({ selected: labels })}
              placeholder={'Tags'}
            />
          </div>
          <Button>
            <Icon name="random" style={styles.formIcon} />
          </Button>
          <Button>
            <Icon name="refresh" style={styles.formIcon} onClick={() => this.setState({ hidden: [] })} />
          </Button>
        </Form>

        {this.renderQuestionList()}
      </div>
    );
  }

  render() {
    const { participant } = this.props;
    const canEdit = ['admin', 'write'].includes(participant.permission);

    if (!canEdit) return <div />;

    const { editing, creating, currentQuestion } = this.state;
    return (
      <Row>
        <CreateQuestionModal
          edit={editing}
          show={creating || editing}
          onHide={this.onModalClose}
          onSave={this.onModalSave}
          question={currentQuestion}
        />

        <Col xs={8} md={8}>
          {this.renderQuestionPool()}
        </Col>
        <Col xs={4} md={4}>
          <Panel>
            <h5><Icon style={styles.icon} name="lightbulb-o" /> Question Pool</h5>
            <hr />
            <p> Group of questions of an specific topic assigned this course by the organization. .</p>
            {renderIf(canEdit)(() =>
              <div>
                <hr />
                <p>Add a custom question to the question pool:</p>
                <Button
                  bsStyle="primary"
                  bsSize="small"
                  onClick={() => this.setState({ creating: true, editing: false, currentQuestion: undefined })}
                >
                  <Icon style={styles.icon} name="plus" />Add Question
                </Button>
              </div>
            )}
          </Panel>
        </Col>
      </Row>
    );
  }
}

const styles = {
  container: {},
  icon: {
    marginRight: 7,
  },
  select: {
    flex: 1,
  },
  formQuestions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  question: {
    flex: 1,
  },
  icons: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 50,
    marginRight: 10,
    marginLeft: 10,
  },
  formIcon: {
    marginLeft: 5,
    marginRight: 5,
  },
};
