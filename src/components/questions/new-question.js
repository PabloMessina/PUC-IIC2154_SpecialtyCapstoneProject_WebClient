import React, { Component } from 'react';
import { Panel, Button } from 'react-bootstrap';
import Title from './title';
import Correlation from './correlation';
import MultiChoice from './multi-choice';
import TShort from './tshort';
import TrueFalse from './true-false';
// import { Colors } from '../../styles';

export default class NewQuestion extends Component {

  static get propTypes() {
    return {
      typeQuestion: React.PropTypes.string,
      question: React.PropTypes.object,
      tags: React.PropTypes.array,
      fields: React.PropTypes.object,
      collapsible: React.PropTypes.bool,
      open: React.PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      typeQuestion: 'tshort',
      question: {},
      tags: [],
      fields: {},
      collapsible: true,
      open: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      typeQuestion: this.props.typeQuestion,
      question: this.props.question,
      tags: this.props.tags,
      fields: this.props.fields,
      collapsible: this.props.collapsible,
      open: this.props.open,
    };
    this.renderQuestion = this.renderQuestion.bind(this);
  }

  renderQuestion(typeQuestion) {
    switch (typeQuestion) {
      case 'correlation': return (
        <Correlation
          permission={'editor'}
          open
        />
      )
      case 'multiChoice': return (
        <MultiChoice
          permission={'editor'}
          open
        />
      )
      case 'tshort': return (
        <TShort
          permission={'editor'}
          open
        />
      )
      case 'trueFalse': return (
        <TrueFalse
          permission={'editor'}
          open
        />);
      default: return null;
    }
  }

  render() {
    return (
      <Panel
        style={styles.container}
        header={<Title
          value={"New question"}
          // tags={tags}
          onClick={() => this.setState({ open: !this.state.open })}
        />}
        collapsible
        expanded={this.state.open}
      >
        <div style={styles.buttons}>
          <Button
            style={styles.button}
            onClick={() => this.renderQuestion('correlation')}
          >
            Correlation
          </Button>
          <Button
            style={styles.button}
            onClick={() => this.renderQuestion('MultiChoice')}
          >
            MultiChoice
          </Button>
          <Button
            style={styles.button}
            onClick={() => this.renderQuestion('trueFalse')}
          >
            True - False
          </Button>
          <Button
            style={styles.button}
            onClick={() => this.renderQuestion('tshort')}
          >
            Text
          </Button>
        </div>
        {this.renderQuestion(this.state.typeQuestion)}
      </Panel>
    );
  }
}

const styles = {
  container: {
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    marginLeft: 10,
    marginRight: 10,
  },
};
