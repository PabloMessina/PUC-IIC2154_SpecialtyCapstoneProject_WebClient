import React, { Component } from 'react';
import {
  Button,
  ButtonToolbar,
  DropdownButton,
  MenuItem,
} from 'react-bootstrap';

import { Colors } from '../../styles';
import NewQuestion from '../questions/new-question';

export default class Questions extends Component {

  static get propTypes() {
    return {
      style: React.PropTypes.any,
      mode: React.PropTypes.string,
    };
  }

  static get defaultProps() {
    return {
      mode: 'preview',
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      mode: props.mode,
    };
    this.changeMode = this.changeMode.bind(this);
    this.renderPreview = this.renderPreview.bind(this);
    this.renderRandomMode = this.renderRandomMode.bind(this);
    this.renderChooseMode = this.renderChooseMode.bind(this);
    this.renderCreateMode = this.renderCreateMode.bind(this);
  }

  changeMode(mode) {
    this.setState({ mode });
  }

  renderPreview() {
    return (<p>preview</p>);
  }

  renderRandomMode() {
    return (<p>random</p>);
  }

  renderChooseMode() {
    return (<p>choose</p>);
  }

  renderCreateMode() {
    return (
      <div style={styles.block}>
        <NewQuestion />
      </div>
    );
  }

  render() {
    return (
      <div styles={[styles.container, this.props.style]}>
        <p>New evaluation</p>
        <ButtonToolbar style={styles.addQuestionContainer}>
          <Button
            style={styles.addQuestionButton}
            bsSize="large"
            onClick={() => this.changeMode('randomQuestions')}
          >
            Choose random
          </Button>
          <Button
            style={styles.addQuestionButton}
            bsSize="large"
            onClick={() => this.changeMode('chooseQuestions')}
          >
            Choose manually
          </Button>
          <Button
            style={styles.addQuestionButton}
            bsSize="large"
            onClick={() => this.changeMode('createQuestions')}
          >
            Create
          </Button>
        </ButtonToolbar>
        {(() => {
          switch (this.state.mode) {
            case 'preview': return (this.renderPreview());
            case 'randomQuestions': return (this.renderRandomMode());
            case 'chooseQuestions': return (this.renderChooseMode());
            case 'createQuestions': return (this.renderCreateMode());
            default: return null;
          }
        })()}
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    alignSelf: 'center',
  },
  addQuestionButton: {
    borderRadius: 0,
    padding: 20,
    border: 0,
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
    size: 16,
  },
  addQuestionContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  block: {
    marginTop: 100,
  },
};
