import React, { Component } from 'react';
import { Grid, Col, Row, Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import AtlasGrid from './atlas-grid';
import renderIf from 'render-if';
import Select from 'react-select';
import { Colors } from '../../styles';
import app from '../../app';
const atlasesService = app.service('/atlases');
import DocumentTitle from 'react-document-title';

export default class DocumentList extends Component {

  static get defaultProps() {
    return {
      atlases: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      atlases: [],
      advanced: false,
      lista: [],
      tags: [],
      organization: 'all',
      allTags: [
        { label: 'Anatomy', value: 'Anatomy' },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Astronomy', value: 'Astronomy' },
        { label: 'Biology', value: 'Biology' },
        { label: 'Technology', value: 'Technology' },
      ],
    };
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.fetchAtlases = this.fetchAtlases.bind(this);
  }
  componentDidMount() {
    this.fetchAtlases();
  }

  // To handle the changes in the tags
  handleSelectChange(value, tags) {
    return this.setState({ tags });
  }

  // To fetch the atlases from the server. First we parse the object given by the Select component.
  // Then, if the input is not empty, we filter by tags
  fetchAtlases() {
    const query = {};
    // Parse array to fit API :
    const tagsArray = [];
    const tags = this.state.tags;
    Object.keys(tags).forEach((key, index) => {
      const tag = tags[key];
      tagsArray[index] = tag.value;
    });
    // Check if there is something in the input :
    if (Object.keys(tagsArray).length > 0) {
      query.tags = tagsArray;
    }
    return atlasesService.find({ query })
      .then(results => {
        this.setState({ atlases: results.data });
      });
  }

  render() {
    // Still need to fix the onSubmit Function of the Form
    return (
      <Grid style={styles.container}>
        <DocumentTitle title="Atlases" />
        <Row style={styles.search}>
          <Form
            style={styles.form}
            horizontal
            onSubmit={(e) => e.preventDefault()}
          >
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
                <Button style={styles.button} onClick={this.fetchAtlases}>
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
          <AtlasGrid atlases={this.state.atlases} />
        </Row>
      </Grid>
    );
  }
}

DocumentList.propTypes = {
  children: React.PropTypes.object,
  atlases: React.PropTypes.array,
};


const styles = {
  container: {
    width: '100%',
    fontFamily: 'Raleway, Helvetica Neue, Helvetica, Arial, sans-serif',
  },
  scroll: {
    display: 'block',
    margin: 'auto',
    width: '88%',
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
