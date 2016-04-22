import React, { Component } from 'react';

import { Button, Input, ButtonInput, Alert } from 'react-bootstrap';
import renderIf from 'render-if';
import browserHistory from 'react-router';
import app from '../../app.js';

export default class CreateAtlas extends Component {

  static get propTypes() {
    return {
      title: React.PropTypes.string,
      authors: React.PropTypes.array,
      description: React.PropTypes.string,
      cover: React.PropTypes.object,
      imagePreviewUrl: React.PropTypes.string,
    };
  }
  static get defaultProps() {
    return {
      title: '',
      authors: [''],
      description: '',
      cover: {},
      imagePreviewUrl: '',
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
    };

    this._handleImageChange = this._handleImageChange.bind(this);
    this.addAuthor = this.addAuthor.bind(this);
    this.changeAuthor = this.changeAuthor.bind(this);
    this.deleteAuthor = this.deleteAuthor.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    const newAtlas = {
      title: this.state.title,
      description: this.state.description,
      cover: this.state.cover,
    };

    const atlasService = app.service('/atlases');

    atlasService.create(newAtlas)
    .then(atlas => {
      console.log(atlas);
      browserHistory.push(`/editor/${atlas.id}`);
    })
    .catch(error =>
           {
             console.log("HOLI");
             this.setState({ error });
           });
  }

  changeAuthor(event, index) {
    const authors = [...this.state.authors];
    authors[index] = event.target.value;
    this.setState({ authors });
  }

  addAuthor() {
    // const authors = [...this.state.authors];
    this.setState({ authors: [...this.state.authors, ''] });
    // if (authors.filter((author) => author === '').length < 1) {
    // }
  }

  deleteAuthor(event, index) {
    event.preventDefault();
    const authors = [...this.state.authors];
    if (authors.length > 1) {
      authors.splice(index, 1);
      this.setState({ authors });
    }
  }

  _handleImageChange(e) {
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
    return (
      <div style={styles.container}>
        <form onSubmit={this.handleSubmit}>
        <h1>Create Atlas</h1>
          <div style={styles.granDiv}>
            <div>
              <div style={styles.item}>
                <label>Atlas Title:</label>
                <Input
                  type="text"
                  value={this.state.title}
                  onChange={(e) => this.setState({ title: e.target.value })}
                />
              </div>
              <div style={styles.item}>
                <label>Atlas Author:</label>
                {this.state.authors.map((author, i) => (
                  <div style={styles.authorInput} key={i}>
                    <Input
                      type="text"
                      style={styles.inputAuthor}
                      value={author}
                      onChange= {e => this.changeAuthor(e, i)}
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
            </div>
            <div style={styles.item}>
              <Input type="file" style={styles.imageInput} onChange={this._handleImageChange} />
              {renderIf(this.state.imagePreviewUrl)(() => (
                <img src={this.state.imagePreviewUrl} />
              ))}
            </div>
          </div>
          <div>
            <label>Description:</label>
            <Input
              type="textarea"
              rows="5"
              onChange={(e) => this.setState({ description: e.target.value })}
            />
          </div>
          <ButtonInput
            type="submit"
            bsStyle="primary"
            value="Submit"
          />

        {renderIf(this.state.error)(() =>
          <Alert bsStyle="danger" onDismiss={() => this.setState({ error: null })}>
            <h4>Oh snap! You got an error!</h4>
            <p>{this.state.error.message}</p>
          </Alert>
        )}
      </form>
      </div>
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
