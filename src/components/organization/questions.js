import React, { PropTypes, Component } from 'react';
import { Grid,
  Row,
  Col,
  Panel,
  Button,
  ControlLabel,
} from 'react-bootstrap';
import Icon from 'react-fa';
import Select from 'react-select';
import renderIf from 'render-if';
import ErrorAlert from '../error-alert';

import app from '../../app';
const questionService = app.service('/questions');

import CreateQuestionModal from '../create-question/modal';
import { TrueFalse, MultiChoice, TShort } from '../questions';


function questionFactory(qtype, props) {
  switch (qtype) {
    case 'trueFalse': return <TrueFalse {...props} />;
    case 'multiChoice': return <MultiChoice {...props} />;
    case 'tshort': return <TShort {...props} />;
    default: return null;
  }
}


export default class CourseTab extends Component {

  static get propTypes() {
    return {
      organization: PropTypes.object,
      membership: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      pool: [],
      qtypes: [
        { label: 'Multi choice', value: 'multiChoice' },
        { label: 'Short text', value: 'tshort' },
        { label: 'True - False', value: 'trueFalse' },
      ],
      tags: [
        { label: 'Tag 1', value: 'Tag 1' },
        { label: 'Tag 2', value: 'Tag 2' },
        { label: 'Tag 3', value: 'Tag 3' },
        { label: 'Tag 4', value: 'Tag 4' },
        { label: 'Tag 5', value: 'Tag 5' },
      ],
      drafts: [],
      selectedTags: [],
      selectedQType: null,
      creating: false,
      error: null,
    };
    this.onModalClose = this.onModalClose.bind(this);
    this.onModalSave = this.onModalSave.bind(this);
    this.renderQuestionList = this.renderQuestionList.bind(this);
    this.renderQuestion = this.renderQuestion.bind(this);
    this.fetchQuestions = this.fetchQuestions.bind(this);
  }

  componentDidMount() {
    this.fetchQuestions(this.props.organization.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.organization) {
      this.fetchQuestions(nextProps.organization.id);
    }
  }

  onModalClose(question) {
    const drafts = [...this.state.drafts, question];
    this.setState({ creating: false, drafts });
  }

  onModalSave(question) {
    // Remove id if present and associate organization
    const data = { ...question, id: undefined, organizationId: this.props.organization.id };

    return questionService.create(data)
      .then(created => this.setState({
        pool: [...this.state.pool, created],
        creating: false,
        error: null,
      }))
      .catch(error => this.setState({ error }));
  }

  fetchQuestions(organizationId) {
    const query = { organizationId };
    return questionService.find({ query })
      .then(result => result.data)
      .then(questions => this.setState({ pool: questions }));
  }

  renderQuestionList() {
    const { pool, selectedQType, selectedTags, qtypes, tags } = this.state;

    const objects = pool
      // Match tags
      .filter(question => selectedTags.every(tag => question.tags.indexOf(tag.label) > -1))
      // Match question types
      .filter(question => (selectedQType ? selectedQType === question.qtype : true))
      // Convert custom object
      .map(question => ({
        question,
        answer: question.answer,
        fields: question.fields,
        disabled: true,
      }));

    return (
      <div style={styles.list}>
        <ControlLabel>Filter by</ControlLabel>
        <form style={styles.formQuestions}>
          <div style={{ width: 140, marginRight: 5 }}>
            <Select
              value={selectedQType}
              options={qtypes}
              onChange={(value) => this.setState({ selectedQType: value })}
              placeholder={'Question type...'}
            />
          </div>
          <div style={{ flex: 2, marginLeft: 5 }}>
            <Select
              multi
              simpleValue={false}
              value={selectedTags}
              options={tags}
              onChange={(value, labels) => this.setState({ selectedTags: labels })}
              placeholder={'Tags...'}
            />
          </div>
        </form>
        <hr />

        {objects.map((object, i) => this.renderQuestion(object, i + 1))}

      </div>
    );
  }

  renderQuestion(props, identifier) {
    const question = props.question;
    return (
      <div key={question.id} style={styles.question}>
        {questionFactory(question.qtype, { ...props, identifier })}
        <hr />
      </div>
    );
  }

  render() {
    const { membership } = this.props;

    return (
      <Grid style={styles.container}>
        <CreateQuestionModal show={this.state.creating} onHide={this.onModalClose} onSave={this.onModalSave} />
        <Row>
          <Col xs={12} md={9}>
            <Row>
              {this.renderQuestionList()}
            </Row>
          </Col>
          <Col xs={12} md={3}>
            <Panel>
              <h4>Questions</h4>
              <p>
                There you have all the available questions (that you can see) on this organization.
              </p>
              <p>
                Some are private to certains courses or people.
              </p>
              {renderIf(['admin', 'write'].includes(membership.permission))(() =>
                <div>
                  <hr />
                  <Button bsStyle="primary" bsSize="small" onClick={() => this.setState({ creating: true })}>
                    <Icon style={styles.icon} name="plus" /> Create question
                  </Button>
                </div>
              )}
            </Panel>
            <ErrorAlert
              error={this.state.error}
              onDismiss={() => this.setState({ error: null })}
            />
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  container: {
  },
  questionPool: {
    padding: 15,
  },
  optionQuestions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectTag: {
    width: '100%',
    height: '100%',
    marginLeft: 5,
  },
  icon: {
    marginRight: 7,
  },
  formQuestions: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
};
