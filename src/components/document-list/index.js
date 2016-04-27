import React, { Component } from 'react';
import { Grid, Col, Row, Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import AtlasThumbnail from './atlas-thumbnail';
import atlasExample from '../../atlas-example.js';
import renderIf from 'render-if';
import Select from 'react-select';
import { Colors } from '../../styles';


export default class Settings extends Component {

  static get defaultProps() {
    return {
      atlases: atlasExample.documents,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      atlases: props.atlases,
      advanced: false,
      tags: [],
      allTags: [
        { label: 'Anatomy', value: 'Tag 1' },
        { label: 'Cardiology', value: 'Tag 2' },
        { label: 'Astronomy', value: 'Tag 3' },
        { label: 'Biology', value: 'Tag 4' },
        { label: 'Technology', value: 'Tag 5' },
      ],
    };
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  handleSelectChange(value, tags) {
    this.forceUpdate();
    return this.setState({ tags });
  }

  render() {
    const lista = [];
    atlasExample.documents.forEach((doc) => {
      lista.push(
        <div style={styles.column} xs={2} md={3}>
          <AtlasThumbnail id={doc.id} document={doc} />
        </div>
      );
    });

    // Use <FormControl type="text" placeholder="" /> instead of Select for simple search
    return (
      <Grid style={styles.container}>
        <Row style={styles.search}>
          <Form style={styles.form} horizontal>
            <h1 style={styles.title}>Search</h1>
            <FormGroup controlId="formHorizontalSearch">
              <Col sm={10}>
                <div style={styles.formTags}>
                  <Select
                    multi
                    simpleValue={false}
                    disabled={false}
                    value={this.state.tags}
                    options={this.state.allTags}
                    onChange={this.handleSelectChange}
                    placeholder={'Tags'}
                  />
                </div>
              </Col>
              <Col sm={2}>
                <Button style={styles.button} type="submit">
                  Search
                </Button>
              </Col>
            </FormGroup>
            {renderIf(this.state.advanced)(() =>
              <FormGroup controlId="formHorizontalFilter">
                <Col sm={3}>
                  <ControlLabel>Genre</ControlLabel>
                  <FormControl componentClass="select" placeholder="">
                    <option value="select">All</option>
                    <option value="other">...</option>
                  </FormControl>
                </Col>
                <Col sm={3}>
                  <ControlLabel>Rating</ControlLabel>
                  <FormControl componentClass="select" placeholder="">
                    <option value="select">All</option>
                    <option value="other">...</option>
                  </FormControl>
                </Col>
                <Col sm={3}>
                  <ControlLabel>Lenguage</ControlLabel>
                  <FormControl componentClass="select" placeholder="">
                    <option value="select">English</option>
                    <option value="other">...</option>
                  </FormControl>
                </Col>
                <Col sm={3}>
                  <ControlLabel>Order By</ControlLabel>
                  <FormControl componentClass="select" placeholder="">
                    <option value="select">Latest</option>
                    <option value="other">...</option>
                  </FormControl>
                </Col>
              </FormGroup>
            )}
            <p style={styles.advanced} onClick={() => this.setState({ advanced: !this.state.advanced })}>Advanced</p>
          </Form>
        </Row>
        <Row>
          <div style={styles.scroll}>
            {lista}
          </div>
        </Row>
      </Grid>
    );
  }
}

Settings.propTypes = {
  children: React.PropTypes.object,
  atlases: React.PropTypes.object,
};


const styles = {
  container: {
    width: '100%',
    fontFamily: 'Raleway, Helvetica Neue, Helvetica, Arial, sans-serif',
  },
  scroll: {
    margin: 'auto',
    width: '90%',
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
  },
  search: {
    color: Colors.MAIN,
    display: 'block',
    backgroundColor: Colors.LIGHTGRAY,
  },
  input: {
    marginLeft: '5%',
    marginRight: '5%',
  },
  form: {
    margin: 'auto',
    width: '80%',
  },
  button: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
  },
  advanced: {
    cursor: 'default',
    textAlign: 'center',
  },
  formTags: {
    width: '100%',
    height: '100%',
    marginLeft: 5,
  },
};
