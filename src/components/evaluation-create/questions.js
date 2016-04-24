import React, { Component } from 'react';
import Select from 'react-select';
import {
  DropdownButton,
  MenuItem,
  FormControl,
  FormGroup,
  Form,
} from 'react-bootstrap';

export default class Questions extends Component {

  static get propTypes() {
    return {
      mode: React.PropTypes.string,
      numberRandomQuestions: React.PropTypes.number,
      tags: React.PropTypes.array,
      allTags: React.PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      mode: 'random',
      numberRandomQuestions: 1,
      tags: [],
      allTags: [{ label: 't1', value: 't1' }, { label: 'soyunsupertag', value: 'soyunsupertag' }],
    };
  }
  constructor(props) {
    super(props);
    this.state = {
      mode: props.mode,
      numberRandomQuestions: props.numberRandomQuestions,
      tags: props.tags,
      allTags: props.allTags,
    };
    this.renderRandom = this.renderRandom.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.changeNumberRandomQuestions = this.changeNumberRandomQuestions.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(value) {
    debugger;
    const index = this.state.tags.findIndex((elem) => elem === value);
    let tags = this.state.tags;
    if (index > -1) {
      tags.splice(index, 1);
    } else {
      tags = [...this.state.tags, value];
    }
    this.setState({ tags });
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
        <Select
          multi
          simpleValue
          disabled={false}
          value={this.state.tags}
          options={this.state.allTags}
          onChange={this.handleSelectChange}
          placeholder={'hola'}
          style={styles.selectTags}
        />
        {/*
        {(() => {
          switch (this.state.mode) {
            case 'random': return (this.renderRandom());
            case 'manually': return (this.renderManually());
            case 'create': return (this.renderCreate());
            default: return null;
          }})()}
          */}
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
  selectTags: {
    width: 500,
  },
};
