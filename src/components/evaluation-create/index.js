import React, { Component } from 'react';
import { Row, Col, ButtonGroup, Button } from 'react-bootstrap';
import { browserHistory } from 'react-router';


const SECTIONS = [
  {
    name: 'Information',
    description: 'Evaluation terms and date',
    path: 'description',
  },
  {
    name: 'Questions',
    description: 'List of questions',
    path: 'questions',
  },
  {
    name: 'Students',
    description: 'Participants and groups',
    path: 'students',
  },
  {
    name: 'Results',
    description: 'Answers and results',
    path: 'results',
  },
  {
    name: 'Recorrection',
    description: 'Problems reported',
    path: 'recorrection',
  },
];

export default class EvaluationCreate extends Component {

  static get propTypes() {
    return {
      // React Router
      params: React.PropTypes.object,
      children: React.PropTypes.any,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      tabStates: Array(SECTIONS.length).fill('default'),
    };
    this.renderSection = this.renderSection.bind(this);
  }

  renderSection(section, i) {
    const { name, description, path } = section;
    const url = `/courses/show/${this.props.params.courseId}/evaluations/create/${path}`;
    return (
      <Button
        style={styles.tab}
        key={i}
        href="#"
        active={this.state.selected === i}
        bsStyle={this.state.tabStates[i]}
        onClick={() => {
          this.setState({ selected: i });
          browserHistory.push(url);
        }}
      >
        <h5 style={styles.tabTitle}>{name}</h5>
        <small style={styles.tabDescription}>{description}</small>
      </Button>
    );
  }

  render() {
    return (
      <div style={styles.container}>
        <h2>Evaluation</h2>
        <Row>
          <Col style={styles.bar} xsOffset={0} xs={12}>
            <ButtonGroup justified>
              {SECTIONS.map((section, i) => this.renderSection(section, i))}
            </ButtonGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col xs={12}>
            {this.props.children}
          </Col>
        </Row>
      </div>
    );
  }
}

const styles = {
  container: {

  },
  bar: {
    marginTop: 15,
  },
  tab: {
    fontSize: 14,
    lineHeight: 1,
    verticalAlign: 'top',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    paddingBottom: 12,
  },
  tabTitle: {
    marginTop: 4,
    marginBottom: 2,
  },
  tabDescription: {

  },
};
