import React, { Component } from 'react';
import {
  DropdownButton,
  MenuItem,
  FormControl,
  FormGroup,
  Grid,
  Row,
  Form,
  Col,
} from 'react-bootstrap';

export default class Questions extends Component {

  static get propTypes() {
    return {
      mode: React.PropTypes.string,
      numberRandomQuestions: React.PropTypes.number,
    };
  }

  static get defaultProps() {
    return {
      mode: 'random',
      numberRandomQuestions: 1,
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      mode: props.mode,
      numberRandomQuestions: props.numberRandomQuestions,
    };
    this.renderRandom = this.renderRandom.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.changeNumberRandomQuestions = this.changeNumberRandomQuestions.bind(this);
  }

  changeMode(e) {
    this.setState({ mode: e });
  }

  changeNumberRandomQuestions(e) {
    this.setState({ numberRandomQuestions: e.target.value });
  }

  renderRandom() {
    return (
        <Form inline>
          <FormGroup style={styles.formRandom}>
              <DropdownButton
                id={'modeDropdown'}
                title={this.state.mode}
                onSelect={this.changeMode}
                style={styles.formMode}
              >
                <MenuItem eventKey="random">Random</MenuItem>
                <MenuItem eventKey="manually">Manually</MenuItem>
                <MenuItem eventKey="create">Create</MenuItem>
              </DropdownButton>

              <FormControl
                type="number"
                min="1"
                value={this.state.numberRandomQuestions}
                onChange={this.changeNumberRandomQuestions}
                style={styles.numberRandomQuestions}
              />
              <FormControl
                type="text"
                placeholder="Tags"
                style={styles.formTags}
              />
          </FormGroup>
        </Form>
    );
  }

  render() {
    return (
      <div style={styles.container}>
        {(() => {
          switch (this.state.mode) {
            case 'random': return (this.renderRandom());
            case 'manually': return (this.renderManually());
            case 'create': return (this.renderCreate());
            default: return null;
          }})()}
      </div>
    );
  }
}

const styles = {
  container: {

  },
  formMode: {
    marginLeft: 5,
    marginRight: 5,
  },
  formTags: {
    marginLeft: 5,
    marginRight: 5,
    width: '100%',
  },
  numberRandomQuestions: {
    marginLeft: 5,
    marginRight: 5,
    width: 80,
  },
  formRandom: {
    display: 'flex',
    flexDirection: 'row',
  },
};
