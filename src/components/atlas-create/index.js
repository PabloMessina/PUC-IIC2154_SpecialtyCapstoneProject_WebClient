import React, { Component } from 'react';
import {
  Button,
  Grid,
  Row,
  Col,
  Panel,
  FormGroup,
  ControlLabel,
  FormControl,
  Alert,
  Breadcrumb,
  Input,
} from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import renderIf from 'render-if';
import Select from 'react-select';

import app from '../../app.js';
const atlasService = app.service('/atlases');

class AtlasCreate extends Component {

  static get propTypes() {
    return {
      title: React.PropTypes.string,
      authors: React.PropTypes.array,
      tags: React.PropTypes.array,
      description: React.PropTypes.string,
      cover: React.PropTypes.string,
      imagePreviewUrl: React.PropTypes.string,
      // From react-router
      router: React.PropTypes.object,
      params: React.PropTypes.object,
    };
  }
  static get defaultProps() {
    return {
      title: '',
      authors: [''],
      description: '',
      cover: '',
      imagePreviewUrl: '',
      tags: [],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      title: this.props.title,
      authors: this.props.authors,
      description: this.props.description,
      cover: this.props.cover,
      imagePreviewUrl: this.props.imagePreviewUrl,
      organization: props.params.organization,
      error: null,
      tags: this.props.tags,
      allTags: [
        { label: 'Anatomy', value: 'Anatomy' },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Astronomy', value: 'Astronomy' },
        { label: 'Biology', value: 'Biology' },
        { label: 'Technology', value: 'Technology' },
      ],
    };

    this.handleImageChange = this.handleImageChange.bind(this);
    this.addAuthor = this.addAuthor.bind(this);
    this.changeAuthor = this.changeAuthor.bind(this);
    this.deleteAuthor = this.deleteAuthor.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.mapArray = this.mapArray.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const organization = nextProps.params.organization;
    if (organization && organization.id !== this.state.organization.id) {
      this.setState({ organization });
    }
  }

  onSubmit(e) {
    e.preventDefault();
    const tagsArray = [];
    const tags = this.state.tags;
    Object.keys(tags).forEach((key, index) => {
      const tag = tags[key];
      tagsArray[index] = tag.value;
    });
    const newAtlas = {
      title: this.state.title,
      description: this.state.description,
      cover: { url: this.state.cover },
      organizationId: this.state.organization.id,
      tags: tagsArray,
    };

    atlasService.create(newAtlas)
      .then(atlas => this.props.router.push(`/editor/${atlas.id}/`))
      .catch(error => this.setState({ error }));
  }

  getValidationState() {
    const length = this.state.title.length;
    if (length > 5) return 'success';
    else if (length > 0) return 'error';
    return '';
  }

  changeAuthor(event, index) {
    const authors = [...this.state.authors];
    authors[index] = event.target.value;
    this.setState({ authors });
  }

  mapArray(item) {
    const array = [item.value].join();
    return array;
  }

  addAuthor() {
    this.setState({ authors: [...this.state.authors, ''] });
  }

  deleteAuthor(event, index) {
    event.preventDefault();
    const authors = [...this.state.authors];
    if (authors.length > 1) {
      authors.splice(index, 1);
      this.setState({ authors });
    }
  }

  // To handle the changes in the tags
  handleSelectChange(value, tags) {
    return this.setState({ tags });
  }

  handleImageChange(e) {
    e.preventDefault();

    const reader = new FileReader();
    const cover = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        cover,
        imagePreviewUrl: reader.result,
      });
    };

    reader.readAsDataURL(cover);
  }

  render() {
    const organization = this.state.organization;

    return (
      <Grid style={styles.container}>

        <br />

        <Breadcrumb>
          <Breadcrumb.Item>
            Organizations
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => this.props.router.push(`/organizations/show/${organization.id}`)}>
            {organization ? organization.name : 'Loading...'}
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={() => this.props.router.push(`/organizations/show/${organization.id}/atlases`)}>
            Atlases
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            Create
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={7}>
            <h2>New Atlas</h2>
          </Col>
        </Row>

        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={7}>
            <p>
              Share knowledge across your organization with rich text books.
              Students and teachers can download your work on their personal devices and take notes and add bookmarks.
            </p>
            <ul>
              <li>Add contributors and work on parallel.</li>
              <li>Restrict your atlas to selected courses or make it private just for you.</li>
              <li>
                Add <strong>sections</strong>
                , <strong>images</strong>,
                <strong>videos</strong> and even
                <strong>3D models
                </strong>.
              </li>
            </ul>

            <hr />

            {renderIf(this.state.error)(() =>
              <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
                <h4>Oh snap! You got an error!</h4>
                <p>{this.state.error.message}</p>
              </Alert>
            )}

            <form onSubmit={this.onSubmit}>

              <FormGroup controlId="name" validationState={this.getValidationState()}>
                <ControlLabel>Title</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.title}
                  placeholder="Advanced calculus"
                  label="Atlas title"
                  onChange={e => this.setState({ title: e.target.value })}
                />
                <FormControl.Feedback />
              </FormGroup>

              <FormGroup controlId="description">
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={this.state.description}
                  placeholder="Atlas description..."
                  onChange={e => this.setState({ description: e.target.value })}
                />
              </FormGroup>

              <FormGroup controlId="cover">
                <ControlLabel>Cover URL</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.cover}
                  placeholder="http://..."
                  label="Cover URL"
                  onChange={e => this.setState({ cover: e.target.value })}
                />
                <FormControl.Feedback />
              </FormGroup>

              <FormGroup controlId="formHorizontalSearch">
                <ControlLabel>Tags</ControlLabel>
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
              </FormGroup>

              {/* <div style={styles.item}>
                <label>Atlas Author:</label>
                {this.state.authors.map((author, i) => (
                  <div style={styles.authorInput} key={i}>
                    <Input
                      type="text"
                      style={styles.inputAuthor}
                      value={author}
                      onChange={e => this.changeAuthor(e, i)}
                    />
                    <Button
                      type="button"
                      style={styles.deleteAuthor}
                      bsStyle="link"
                      onClick={e => this.deleteAuthor(e, i)}
                    >
                      -
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  bsStyle="link"
                  onClick={this.addAuthor}
                  style={styles.addAuthor}
                >
                  Add Author
                </Button>
              </div>

              <div style={styles.item}>
                <Input type="file" style={styles.imageInput} onChange={this.handleImageChange} />
                {renderIf(this.state.imagePreviewUrl)(() => (
                  <Image src={this.state.imagePreviewUrl} />
                ))}
              </div>

              <hr />*/}

              <Button bsStyle="primary" type="submit">
                Create Atlas
              </Button>

            </form>
          </Col>

          <Col xsOffset={0} xs={12} sm={3}>
            <Panel>
              <h5><Icon style={styles.icon} size="lg" name="info-circle" /> Need help?</h5>
              <hr />
              <p>Take a look at our showcase or contact us.</p>
            </Panel>
          </Col>

        </Row>
      </Grid>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
  authorInput: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  deleteAuthor: {
    display: 'flex',
    alignSelf: 'stretch',
    textDecoration: 'none',
  },
  addAuthor: {
    paddingLeft: 0,
  },
  inputAuthor: {
    display: 'flex',
    alignSelf: 'center',
  },
  item: {
    display: 'flex',
    marginTop: 25,
    marginBottom: 25,
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  granDiv: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
};

export default withRouter(AtlasCreate);
