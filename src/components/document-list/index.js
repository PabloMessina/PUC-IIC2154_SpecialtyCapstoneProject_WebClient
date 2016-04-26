import React, { Component } from 'react';
import { Grid, Col, Row, Button, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import AtlasThumbnail from './atlas-thumbnail';
import atlasExample from '../../atlas-example.js';
import renderIf from 'render-if';


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
    return (
      <Grid style={styles.container}>
        <Row style={styles.search}>
          <Form style={styles.form} horizontal>
            <h1 style={styles.title}>Search</h1>
            <FormGroup controlId="formHorizontalSearch">
              <Col sm={10}>
                <FormControl type="text" placeholder="" />
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
            <p onClick={() => this.setState({ advanced: !this.state.advanced })}>Advanced</p>
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
    textAlign: 'center',
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
    color: '#16a085',
    display: 'block',
    backgroundColor: '#f1f1f1',
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
    backgroundColor: '#16a085',
    color: 'white',
  },
};
