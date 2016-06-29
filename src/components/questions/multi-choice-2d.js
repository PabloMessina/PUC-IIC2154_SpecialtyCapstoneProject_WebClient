/* eslint react/sort-comp:0, no-alert:0, no-console:0, no-param-reassign:0, no-constant-condition:0 */
import React, { Component } from 'react';
import { Dropdown, ListGroup, Checkbox } from 'react-bootstrap';
import Icon, { IconStack } from 'react-fa';
import compose, { QuestionPropTypes } from './question';
import ImageWithRegions from '../interactive-images/with-regions/image-with-regions';
import renderIf from 'render-if';

class MultiChoice2D extends Component {

  static get propTypes() {
    return QuestionPropTypes;
  }

  static get defaultProps() {
    return {
      fields: {
        circleRadius: 4,
        source: { url: 'http://www.humpath.com/IMG/jpg_brain_front_cut_01_10.jpg' },
        // TODO: implement choosing a local file and uploading it to server
        // before rendering the image
        regions: [],
      },
      answer: {
        choices: [],
      },
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      fields: props.fields,
      answer: props.answer,
    };
    this.handleRegionsChange = this.handleRegionsChange.bind(this);
    this.handleSelectedRegionsChange = this.handleSelectedRegionsChange.bind(this);
    this.handleRegionsAndSelectedChange = this.handleRegionsAndSelectedChange.bind(this);
    this.handleCircleRadiusChange = this.handleCircleRadiusChange.bind(this);
    this.renderEditor = this.renderEditor.bind(this);
    this.renderResponder = this.renderResponder.bind(this);
    this.toggleRegionSelection = this.toggleRegionSelection.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      fields: nextProps.fields,
      answer: nextProps.answer,
    });
  }

  handleRegionsChange(regs) {
    const fields = { ...this.state.fields, regions: regs };
    this.setState({ fields }, () => this.props.onFieldsChange(fields));
  }

  handleSelectedRegionsChange(ids) {
    const answer = { choices: ids };
    this.setState({ answer }, () => this.props.onAnswerChange(answer));
  }

  handleRegionsAndSelectedChange(regs, ids) {
    const fields = { ...this.state.fields, regions: regs };
    const answer = { choices: ids };
    this.setState({ fields, answer },
      () => this.props.onFieldsAndAnswerChange(fields, answer)
    );
  }

  handleCircleRadiusChange(e) {
    const fields = { ...this.state.fields, circleRadius: Number(e.target.value) };
    this.setState({ fields }, () => this.props.onFieldsChange(fields));
  }

  toggleRegionSelection(i) {
    const { regions } = this.state.fields;
    const choices = this.state.answer.choices.slice(0);
    const id = regions[i].id;
    const index = choices.indexOf(id);
    if (index > -1) choices.splice(index, 1);
    else choices.push(id);
    const answer = { choices };
    this.setState({ answer }, () => this.props.onAnswerChange(answer));
  }

  renderReader() {
    const { fields, answer } = this.state;
    const { source, regions, circleRadius } = fields;
    const { choices } = answer;
    return (
      <div>
        <ImageWithRegions
          style={styles.img}
          mode="READONLY"
          source={source}
          regions={regions}
          selectedRegionIds={choices}
          circleRadius={circleRadius}
          maxWidth={500}
          maxHeight={500}
          disabled
        />
        <ListGroup style={styles.list}>
        {regions.map(reg => (
          <Checkbox
            key={`cbreg${reg.id}`}
            checked={choices.indexOf(reg.id) > -1}
            disabled
          >
            {reg.string}
          </Checkbox>
        ))}
        </ListGroup>
      </div>
    );
  }

  renderResponder() {
    const { disabled } = this.props;
    const { fields, answer } = this.state;
    const { source, regions, circleRadius } = fields;
    const { choices } = answer;
    return (
      <div>
        <ImageWithRegions
          style={styles.img}
          mode="MULTISELECT"
          source={source}
          regions={regions}
          selectedRegionIds={choices}
          circleRadius={circleRadius}
          maxWidth={500}
          maxHeight={500}
          onSelectedRegionsChange={this.handleSelectedRegionsChange}
          disabled={disabled}
        />
        <ListGroup style={styles.list}>
        {regions.map((reg, i) => (
          <Checkbox
            key={`cbreg${reg.id}`}
            checked={choices.indexOf(reg.id) > -1}
            onChange={() => this.toggleRegionSelection(i)}
            disabled={disabled}
          >
            {reg.string}
          </Checkbox>
        ))}
        </ListGroup>
      </div>
    );
  }

  renderEditor() {
    const { disabled } = this.props;
    const { fields, answer } = this.state;
    const { source, regions, circleRadius } = fields;
    const { choices } = answer;
    const hasRegions = regions.length > 0;

    return (
      <div>
      {renderIf(hasRegions)(() => (
        <div style={styles.toolbar}>
          <Dropdown
            id="multichoice-2d-dropdown"
            dropdown
          >
            <Dropdown.Toggle
              style={styles.toolbarButton}
              bsRole="toggle"
              bsStyle="default"
              bsSize="small"
              className="dropdown-with-input dropdown-toggle"
            >
              <IconStack size="2x">
                <Icon name="circle" stack="2x" />
                <Icon name="cog" stack="1x" style={styles.icon} />
              </IconStack>
            </Dropdown.Toggle>
            <Dropdown.Menu className="super-colors">
              <div>
                <label>Circle Radius: </label>
                <input
                  ref="circleRadiusInput"
                  type="range" min={1} max={20} step={0.2}
                  value={circleRadius}
                  onChange={this.handleCircleRadiusChange}
                  disabled={disabled}
                />
                <span>{circleRadius.toFixed(2)}</span>
              </div>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      ))}
        <div>
          <ImageWithRegions
            style={styles.img}
            mode="EDITION"
            source={source}
            regions={regions}
            selectedRegionIds={choices}
            circleRadius={circleRadius}
            maxWidth={500}
            maxHeight={500}
            onRegionsChange={this.handleRegionsChange}
            onSelectedRegionsChange={this.handleSelectedRegionsChange}
            onRegionsAndSelectedChange={this.handleRegionsAndSelectedChange}
            disabled={disabled}
          />
          <ListGroup style={styles.list}>
          {regions.map((reg, i) => (
            <Checkbox
              key={`cbreg${reg.id}`}
              checked={choices.indexOf(reg.id) > -1}
              onChange={() => this.toggleRegionSelection(i)}
              disabled={disabled}
            >
              {reg.string}
            </Checkbox>
          ))}
          </ListGroup>
        </div>
      </div>
    );
  }

  render() {
    switch (this.props.mode) {
      case 'editor': return this.renderEditor();
      case 'responder': return this.renderResponder();
      case 'reader': return this.renderResponder();
      default: return null;
    }
  }
}

const styles = {
  list: {
    maxHeight: 400,
    minWidth: 50,
    overflowY: 'scroll',
    float: 'left',
    marginLeft: 20,
  },
  img: {
    float: 'left',
  },
  inlineBlockme: {
    display: 'inline-block',
  },
  toolbar: {
    height: '44px',
  },
  toolbarButton: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    padding: 3,
  },
  icon: {
    color: 'white',
  },
};


export default compose(MultiChoice2D);
