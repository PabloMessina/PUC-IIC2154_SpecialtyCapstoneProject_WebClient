import React, { Component } from 'react';
import { Grid, Col, Row, Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import AtlasThumbnail from './atlas-thumbnail';
import renderIf from 'render-if';
import Select from 'react-select';
import { Colors } from '../../styles';
import app from '../../app';
const atlasesService = app.service('/atlases');

export default class DocumentList extends Component {

  static get defaultProps() {
    return {
      atlases: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      atlases: props.atlases,
      advanced: false,
      lista: [],
      tags: [],
      allTags: [
        { label: 'Anatomy', value: 'Anatomy' },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Astronomy', value: 'Astronomy' },
        { label: 'Biology', value: 'Biology' },
        { label: 'Technology', value: 'Technology' },
      ],
    };
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.findOne = this.findOne.bind(this);
    this.filterDocuments = this.filterDocuments.bind(this);
  }

  componentDidMount() {
    this.fetchTree();
  }

  // To fetch the atlases from the server
  fetchTree() {
    const query = {
    };

    return atlasesService.find({ query })
      .then(results => {
        this.setState({ atlases: results.data });
      });
  }
  // To find an atlas with at least one of the tags
  findOne(haystack, arr) {
    return haystack.every(v => arr.indexOf(v.label) >= 0);
  }

  // To handle the changes in the tags
  handleSelectChange(value, tags) {
    this.forceUpdate();
    this.setState({ tags });
    this.state.lista = [];
    this.state.atlases.forEach((doc) => {
      const search = this.findOne(this.state.tags, doc.tags);
      if (search || this.state.tags.length === 0) {
        this.state.lista.push(
          <div style={styles.column} xs={2} md={3}>
            <AtlasThumbnail id={doc.id} document={doc} />
          </div>
        );
      }
    });
  }


  // For the first actualization and when you press the button search
  filterDocuments() {
    this.state.lista = [];
    this.state.atlases.forEach((doc) => {
      const search = this.findOne(this.state.tags, doc.tags);
      if (search || this.state.tags.length === 0) {
        this.state.lista.push(
          <div style={styles.column} xs={2} md={3}>
            <AtlasThumbnail id={doc.id} document={doc} />
          </div>
        );
      }
    });
  }

  render() {
    this.filterDocuments();
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
                <Button style={styles.button} onClick={this.filterDocuments()}>
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
            {this.state.lista}
          </div>
        </Row>
      </Grid>
    );
  }
}

DocumentList.propTypes = {
  children: React.PropTypes.object,
  atlases: React.PropTypes.object,
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
