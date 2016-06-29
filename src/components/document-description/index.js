/* eslint no-alert: 0 */

import React, { PropTypes, Component } from 'react';
import {
  Grid,
  Image,
  Panel,
  Col,
  Row,
  Button,
  Nav,
  NavItem,
  FormGroup,
  FormControl,
  ControlLabel } from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import moment from 'moment';
import Select from 'react-select';
import renderIf from 'render-if';
import DocumentTitle from 'react-document-title';

import ErrorAlert from '../error-alert/';

import app, { currentUser } from '../../app';
const atlasesService = app.service('/atlases');
// const annotationService = app.service('/annotations');
// const bookmarkService = app.service('/annotations');

import { Colors } from '../../styles';


class DocumentDescription extends Component {

  static get propTypes() {
    return {
      router: PropTypes.object,
      atlas: PropTypes.object,
      params: PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      atlas: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      atlas: this.props.params.atlas,
      tags: this.props.params.atlas.tags,
      selectedTab: 1,
      editable: false,
      title: this.props.params.atlas.title,
      authors: this.props.params.atlas.authors,
      description: this.props.params.atlas.description,
      cover: this.props.params.atlas.cover.url,
      allTags: [
        { label: 'Anatomy', value: 'Anatomy' },
        { label: 'Cardiology', value: 'Cardiology' },
        { label: 'Astronomy', value: 'Astronomy' },
        { label: 'Biology', value: 'Biology' },
        { label: 'Technology', value: 'Technology' },
      ],
      annotations: [{
        content: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo.',
        userId: 'Uhash1234',
        sectionId: 'Seccion 12.3',
        createdAt: '05-11-2015',
        updatedAt: '22-12-2015',
      }, {
        content: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. ',
        userId: 'Uhash1234',
        sectionId: 'Seccion 12.3',
        createdAt: '05-11-2015',
        updatedAt: '22-12-2015',
      }, {
        content: 'my tercer apunte',
        userId: 'Uhash1234',
        sectionId: 'Seccion 12.3',
        createdAt: '05-11-2015',
        updatedAt: '22-12-2015',
      }, {
        content: 'my cuarto apunte',
        userId: 'Uhash1234',
        sectionId: 'Seccion 12.3',
        createdAt: '05-11-2015',
        updatedAt: '22-12-2015',
      }, {
        content: 'my quinto apunte',
        userId: 'Uhash1234',
        sectionId: 'Seccion 12.3',
        createdAt: '05-11-2015',
        updatedAt: '22-12-2015',
      }],
      bookmarks: [{
        sectionId: '19.4',
        savedAs: 'Musculos Faciales y Movimiento Mandibular',
      }, {
        sectionId: '22.3',
        savedAs: 'Huesos',
      }, {
        sectionId: '25.4',
        savedAs: 'LEER MAS TARDE!',
      }, {
        sectionId: '17',
        savedAs: 'Repasar',
      }],
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleDeleteAnnotation = this.handleDeleteAnnotation.bind(this);
    this.handleDeleteBookmark = this.handleDeleteBookmark.bind(this);
    this.onPressDelete = this.onPressDelete.bind(this);
    this.onSubmitUpdate = this.onSubmitUpdate.bind(this);
    this.tagsObjectToArray = this.tagsObjectToArray.bind(this);
  }

  componentDidMount() {
    this.fetchTree();
  }

  onPressDelete() {
    if (window.confirm('Delete Atlas? All the content will be lost.')) {
      return atlasesService.remove(this.props.params.atlas.id)
        .then(() => this.props.router.push('/documents'))
        .catch(error => this.setState({ error }));
    }
    return false;
  }

  onSubmitUpdate(e) {
    e.preventDefault();
    const tags = this.state.tags;
    const tagsArray = this.tagsObjectToArray(tags);
    const newAtlas = {
      title: this.state.title,
      description: this.state.description,
      cover: { url: this.state.cover },
      tags: tagsArray,
    };

    atlasesService.patch(this.props.params.atlas.id, newAtlas)
      .then(this.setState({ editable: false }))
      .catch(error => this.setState({ error }));
  }

  getValidationState() {
    const length = this.state.title.length;
    if (length > 5) return 'success';
    else if (length > 0) return 'error';
    return '';
  }

  // Get object of tags from API and parse it to an Array (for the Select Component)
  tagsObjectToArray(tags) {
    const tagsArray = [];
    Object.keys(tags).forEach((key, index) => {
      const tag = tags[key];
      tagsArray[index] = tag.value;
    });
    return tagsArray;
  }

  fetchTree() {
    const query = {
      atlasId: this.props.params.atlasId,
    };

    return atlasesService.find({ query })
      .then(results => {
        this.setState({ atlas: results.data });
      });
  }

/*
  fetchAnnotations() {
    const query = {
      userId: currentUser().id,
      atlasId: this.state.atlas.id,
    };

    return annotationService.find({ query })
    .then(results => {
      this.setState({ annotations: results.data });
    });
  }

  fetchBookmarks() {
    const query = {
      userId: currentUser().id,
      atlasId: this.state.atlas.id,
    };

    return bookmarkService.find({ query })
    .then(results => {
      this.setState({ bookmarks: results.data });
    });
  }

  goToBookmark(id) {
  ...
}

  goToAnnotation(id) {
  ...
}
*/

/**
 * [Shows bookmarks or annotations accordingly. selectedTab handles it.]
 * @param {integet} eventkey [1 or 2. Depends on choosing bookmarks or annotations view]
 */
  handleSelect(eventKey) {
    event.preventDefault();
    this.setState({ selectedTab: eventKey });
  }

  // To handle the changes in the tags
  handleSelectChange(value, tags) {
    return this.setState({ tags });
  }

  /**
   * [Deletes annotation in database and locally on selecting trash symbol.]
   * @param {integer} key [key value of annotation for frontEnd deletion]
   * @param {integer} id {id value of annotation for backEnd deletion}
   */
  handleDeleteAnnotation(key, id) { // eslint-disable-line
    if (window.confirm('Delete annotation? Deleted annotations cannot be recovered')) {
      // Delete annotation from state
      const annotations = [...this.state.annotations];
      annotations.splice(key, 1);
      this.setState({ annotations });

      // Delete annotation from database. Needs Annotation_ID. TODO Join in one to keep consistency.
      /*
      const query = {
        annotationId: id,
      };
      annotationService.remove(id).then(() => {
      const annotations = [...this.state.annotations];
      annotations.splice(key, 1);
      this.setState({ annotations });
    });
      */
    }
  }

  /**
   * [Deletes bookmarks in database and locally on selecting trash symbol.]
   * @param {integer} key [key value of bookmark for frontEnd deletion]
   * @param {integer} id {id value of bookmark for backEnd deletion}
   */
  handleDeleteBookmark(key, id) { // eslint-disable-line
    if (window.confirm('Delete bookmark? Deleted bookmarks cannot be recovered')) {
      // Delete annotation from state
      const bookmarks = [...this.state.bookmarks];
      bookmarks.splice(key, 1);
      this.setState({ bookmarks });
      // Delete bookmark from database. Needs Bookmark_ID. Join in one.TODO Join in one to keep consistency.
      /*
      const query = {
        bookmarkId: id,
      };
      bookmarkService.remove(id).then(() => {
      const bookmarks = [...this.state.bookmarks];
      bookmarks.splice(key, 1);
      this.setState({ bookmarks });
    });;
      */
    }
  }

  renderAnnotations() {
    return this.state.annotations.map((annotation, key) =>
      <div key={key} style={styles.contentContainer}>
        <div style={styles.rowUp}>
          <div style={styles.annotationTitle}>
            <h3> {annotation.sectionId} </h3>
          </div>
          <div>
            <Button bsStyle="link" bsSize="small" style={styles.buttonPanel}>
              <Icon
                name="fa fa-pencil"
              /> Edit
            </Button>
            <Button
              style={styles.buttonPanel}
              bsStyle="link"
              bsSize="small"
              value={key}
              onClick={e => this.handleDeleteAnnotation(e.target.value)}
            >
              <Icon name="fa fa-trash-o" /> Delete
            </Button>
          </div>
        </div>
        <div> {annotation.content} </div>
        <hr />
      </div>
    );
  }

  renderBookmarks() {
    return this.state.bookmarks.map((bookmark, key) =>
      <div key={key}>
        <div style={styles.rowUp}>
          <div>
            <h3> {bookmark.sectionId} {bookmark.savedAs} </h3>
          </div>
          <div>
            <Button
              value={key}
              style={styles.buttonPanel}
              bsStyle="link"
              bsSize="small"
            >
              <Icon
                name="fa fa-pencil"
              /> Edit
            </Button>
            <Button
              value={key}
              style={styles.buttonPanel}
              bsStyle="link"
              bsSize="small"
              onClick={e => this.handleDeleteBookmark(e.target.value)}
            >
              <Icon
                name="fa fa-trash-o"
              /> Delete
            </Button>
          </div>
        </div>
        <hr />
      </div>
    );
  }

  render() {
    const doc = this.props.params.atlas;
    const route = `/editor/${doc.id}/`;
    let image = doc.cover.url;
    let tags = this.state.tags;
    if (tags[0] === null || tags[0] === undefined || tags === []) {
      tags = [];
    } else if (typeof tags[0] === 'object') {
      tags = this.tagsObjectToArray(this.state.tags);
    }
    image = image || 'http://sightlinemediaentertainment.com/wp-content/uploads/2015/09/placeholder-cover.jpg';
    tags = tags.map((element) => ` ${element}`);
    return (
      <Grid>
        <DocumentTitle title={this.state.title} />
        <Col md={9}>
          <Panel style={styles.panel}>
            <Row className="show-grid">
              <Col xs={6} md={4}>
                <Image src={image} responsive />
              </Col>
              <Col xs={6} md={8}>
              {(!this.state.editable ?
                <div>
                  <h3>{this.state.title}</h3>
                  <p>{`${moment(doc.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`}</p>
                  <p>{`Tags: ${tags}`}</p>
                  <p>{`Description: ${this.state.description}`}</p>
                  {renderIf(currentUser().id === doc.responsableId)(() =>
                    <Button
                      bsStyle="link"
                      bsSize="small"
                      onClick={() => this.setState({ editable: true })}
                    >
                      <Icon
                        name="fa fa-pencil"
                      /> Edit
                    </Button>
                  )}
                  <hr />
                  <Button style={styles.button} onClick={() => this.props.router.push(route)}>
                    Go to Atlas
                  </Button>
                </div>
              :
                <form onSubmit={this.onSubmitUpdate}>
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
                        allowCreate
                        simpleValue={false}
                        disabled={false}
                        value={tags}
                        options={this.state.allTags}
                        onChange={this.handleSelectChange}
                        placeholder={'Tags'}
                      />
                    </div>
                  </FormGroup>

                  <Button bsStyle="primary" type="submit">
                    Update Atlas
                  </Button>
                  <Button style={styles.buttonDelete} onClick={() => this.onPressDelete()}>
                    Delete
                  </Button>
                  <Button style={styles.buttonCancel} onClick={() => this.setState({ editable: false })}>
                    Cancel
                  </Button>
                </form>
              )}
              </Col>
            </Row>
          </Panel>
        </Col>
        <Col xs={12} md={3}>
          <Panel style={styles.panel}>
            <h4>Take a look inside</h4>
            <p>Click "Go to Atlas" to view the contents of this book</p>
            <hr />
            <p>
              View your annotations and bookmarks in the panel below.
              Press the eye icon to navigate to them and the trash icon to delete them.
            </p>
            <ErrorAlert
              error={this.state.error}
              onDismiss={() => this.setState({ error: null })}
            />
          </Panel>
        </Col>
        <Col xs={12} md={12}>
          <Panel>
            <Nav bsStyle="tabs" activeKey={this.state.selectedTab} onSelect={this.handleSelect}>
              <NavItem eventKey={1}> <Icon name="pencil" style={styles.icon} /> My Notes</NavItem>
              <NavItem eventKey={2} title="Item"> <Icon name="bookmark" style={styles.icon} /> My Bookmarks </NavItem>
            </Nav>
             {(() => {
               switch (this.state.selectedTab) {
                 case 1: return this.renderAnnotations();
                 case 2: return this.renderBookmarks();
                 default: return this.renderAnnotations();
               }
             })()}
          </Panel>
        </Col>
      </Grid>
    );
  }
}

const styles = {
  panel: {
    marginTop: 20,
  },
  button: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
  },
  buttonDelete: {
    backgroundColor: Colors.RED,
    color: Colors.WHITE,
    marginLeft: 10,
  },
  buttonCancel: {
    backgroundColor: Colors.GRAY,
    color: Colors.WHITE,
    marginLeft: 10,
  },
  tags: {
    color: Colors.MAIN,
  },
  rowUp: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: 0,
  },
  buttonPanel: {
    marginTop: 10,
    marginLeft: 3,
    padding: 10,
  },
  annotationTitle: {
    paddingBottom: 20,
  },
  icon: {
    marginRight: 4,
  },
};

// this.props.params.docId
export default withRouter(DocumentDescription);
