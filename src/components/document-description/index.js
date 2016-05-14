import React, { Component } from 'react';
import { Grid, Image, Panel, Col, Row, Button, Media, Glyphicon, Nav, NavItem } from 'react-bootstrap';
import Icon from 'react-fa';
import app, { currentUser } from '../../app';
import { Colors } from '../../styles';
import { browserHistory } from 'react-router';
const atlasesService = app.service('/atlases');
const annotationService = app.service('/annotations');
// const bookmarkService = app.service('/annotations');

// TODO descomentar feathers y asegurar conexion
// TODO apretar ojo para navegar a bookmark/annotation

export default class DocumentDescription extends Component {

  static get defaultProps() {
    return {
      atlas: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      atlas: props.atlas,
      selectedTab: 1,
      annotations: [{
        content: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus',
        userId: 'Uhash1234',
        sectionId: 'Seccion 12.3',
        createdAt: '05-11-2015',
        updatedAt: '22-12-2015',
      }, {
        content: 'Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibusCras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus',
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
      },
        ],
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
      },
    ],
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleDeleteAnnotation = this.handleDeleteAnnotation.bind(this);
    this.handleDeleteBookmark = this.handleDeleteBookmark.bind(this);
  }

  componentDidMount() {
    this.fetchTree();
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

  /**
   * [Deletes annotation in database and locally on selecting trash symbol.]
   * @param {integer} key [key value of annotation for frontEnd deletion]
   * @param {integer} id {id value of annotation for backEnd deletion}
   */
  handleDeleteAnnotation(key, id) {
    if (window.confirm("Delete annotation? Deleted annotations cannot be recovered")) {
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
  handleDeleteBookmark(key, id) {
    if (window.confirm("Delete bookmark? Deleted bookmarks cannot be recovered")) {
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
    return (
      this.state.annotations.map((annotation, key) =>
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
  ));
  }

  renderBookmarks() {
    return (
      this.state.bookmarks.map((bookmark, key) =>
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
  ));
  }

  render() {
    const doc = this.props.params.atlas;
    let image = doc.cover.url;
    const route = `/editor/${doc.id}/`;
    image = image || 'http://sightlinemediaentertainment.com/wp-content/uploads/2015/09/placeholder-cover.jpg';
    return (
      <Grid>
        <Col md={9}>
          <Panel style={styles.panel} footer={doc.description}>
            <Row className="show-grid">
              <Col xs={6} md={4}>
                <Image src={image} responsive />
              </Col>
              <Col xs={6} md={8}>
                <h3>{doc.title}</h3>
                <p>Year: 'Date of creation'</p>
                <p>Tags: 'Here will be the tags of the atlas</p>
                <p>{doc.tags}</p>
                <Button style={styles.button} onClick={() => browserHistory.push(route)}>
                  Go to Atlas
                </Button>
              </Col>
            </Row>
          </Panel>
        </Col>
        <Col xs={12} md={3}>
          <Panel style={styles.panel}>
            <h4>Take a look inside</h4>
            <p>Click "Go to Atlas" to view the contents of this book</p>
            <hr />
            <p>View your annotations and bookmarks in the panel below.
            Press the eye icon to navigate to them and the trash icon to delete them.</p>
          </Panel>
        </Col>
        <Col xs={12} md={12}>
          <Panel>
            <Nav bsStyle="tabs" activeKey={this.state.selectedTab} onSelect={this.handleSelect}>
              <NavItem eventKey={1}> <Glyphicon glyph="pencil" /> My Notes</NavItem>
              <NavItem eventKey={2} title="Item"> <Glyphicon glyph="bookmark" /> My Bookmarks </NavItem>
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

DocumentDescription.propTypes = {
  atlas: React.PropTypes.object,
  params: React.PropTypes.object,
};

const styles = {
  panel: {
    marginTop: 20,
  },
  button: {
    backgroundColor: Colors.MAIN,
    color: Colors.WHITE,
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
};

// this.props.params.docId
