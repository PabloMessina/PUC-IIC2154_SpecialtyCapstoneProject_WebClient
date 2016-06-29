import React, { Component } from 'react';
import Icon from 'react-fa';
import Dropzone from 'react-dropzone';
import {
  FormGroup,
  FormControl,
  ControlLabel,
  Modal,
  Button,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import update from 'react-addons-update';
import renderIf from 'render-if';
import JSZip from 'jszip';

import ErrorAlert from '../error-alert';
// const SUPPORTED_FILES = {
  // image: ['jpg'],
// };
const URL = 'http://files.lupi.online/api/v1/storage';
export default class FileModal extends Component {
  static get propTypes() {
    return {
      show: React.PropTypes.bool,
      onSuccess: React.PropTypes.func,
      onHide: React.PropTypes.func,
      maxFiles: React.PropTypes.number,
      acceptedFiles: React.PropTypes.string,
      acceptUrl: React.PropTypes.bool,
      type: React.PropTypes.string,
      zip: React.PropTypes.bool,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      value: '',
      files: [],
      fileUrls: [],
      uploadState: null,
    };

    // this.updateProgress = this.updateProgress.bind(this);
    this.clear = this.clear.bind(this);
    this.onHide = this.onHide.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.onDropRejected = this.onDropRejected.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onRemoveFile = this.onRemoveFile.bind(this);
    this.onUrlChange = this.onUrlChange.bind(this);
  }

  onHide() {
    const { uploadState, error } = this.state;
    if (!error && uploadState !== null && uploadState !== 'success') {
      return;
    } else {
      if (uploadState === 'success') this.onSuccess();

      this.clear();
      this.props.onHide();
    }
  }

  onSuccess() {
    const { fileUrls } = this.state;
    const { onSuccess } = this.props;
    // this.dropzone.options.autoProcessQueue = false;
    this.setState({
      files: [],
      fileUrls: [],
      value: null,
      uploadState: null,
    }, () => {
      if (fileUrls.length === 0) return;
      this.props.onHide(() => {
        onSuccess(fileUrls);
      });
    });
  }

  onDrop(dropped) {
    const files = update(this.state.files, { $push: dropped });
    this.setState({ files });
  }

  onDropRejected() {
    this.setState({ uploadState: null, error: 'Unsupported files!' });
  }

  onUpload() {
    const { zip } = this.props;
    const { files } = this.state;

    const uploadData = (data) => {
      const req = {
        method: 'POST',
        body: data,
      };
      this.setState({ uploadState: 'uploading' });
      return fetch(`${URL}/store`, req)
        .then(result => result.json())
        .then(value => {
          const fileUrls = value.fileNames.map((name) => `${URL}/${name}`);
          this.setState({ fileUrls, uploadState: 'success' });
        })
        .catch(error => this.setState({ error, uploadState: null }));
    };

    const data = new FormData();

    if (zip) {
      const zipper = new JSZip();
      files.forEach((file) => zipper.file(file.name, file));
      this.setState({ uploadState: 'compressing' });
      zipper.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: 9,
      })
      .then(content => {
        data.append('file', content);
        uploadData(data);
      });
    } else {
      files.forEach((file) => data.append('file', file));
      uploadData(data);
    }
  }

  onClick() {
    const { uploadState, error } = this.state;
    if (uploadState === 'success' && !error) {
      this.onSuccess();
    } else if (error) {
      this.onHide();
    } else {
      this.onUpload();
    }
  }

  onRemoveFile(e, index) {
    e.preventDefault();
    e.stopPropagation();
    const files = update(this.state.files, { $splice: [[index, 1]] });
    this.setState({ files });
  }

  onUrlChange(e) {
    this.clear();
    const value = e.target.value;
    this.setState({ fileUrls: [value], value, uploadState: 'success' });
  }

  clear() {
    this.setState({
      value: '',
      files: [],
      fileUrls: [],
      uploadState: null,
      error: null,
    });
  }

  render() {
    const { show, acceptedFiles, maxFiles, acceptUrl } = this.props;
    const { files, uploadState, error } = this.state;

    let buttonText;
    let buttonDisabled = true;
    switch (uploadState) {
      case 'uploading':
        buttonText = 'Uploading...';
        break;
      case 'compressing':
        buttonText = 'Compressing...';
        break;
      default:
        buttonText = 'Ok';
        buttonDisabled = false;
    }

    return (
      <Modal show={show} onHide={this.onHide}>
        <Modal.Body>
          {renderIf(!error && uploadState !== 'success')(() => (
            <div>
              {renderIf(acceptUrl)(() => (
                <FormGroup>
                  <ControlLabel>Type in an url:</ControlLabel>
                  <FormControl
                    type="text"
                    value={this.state.value}
                    placeholder="http://www.something.com/hello.png"
                    onChange={this.onUrlChange}
                  />
                </FormGroup>
              ))}
              <Dropzone
                style={styles.dropzone}
                accept={acceptedFiles}
                onDrop={this.onDrop}
                onDropRejected={this.onDropRejected}
              >
                {renderIf(files)(() => (
                  <ListGroup>
                    {files.map((file, i) => (
                      <ListGroupItem style={styles.file} key={i}>
                        {file.name}
                        <Icon name="remove" onClick={(e) => this.onRemoveFile(e, i)} />
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                ))}

                {renderIf(files.length === 0)(() => (
                  <p>Click or drop some files!</p>
                ))}
              </Dropzone>
            </div>
          ))}
          {renderIf(uploadState === 'success')(() => (
            <p>All files uploaded!</p>
          ))}
          <ErrorAlert
            error={this.state.error}
            onDismiss={() => this.setState({ error: null })}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={buttonDisabled}
            bsStyle={error ? 'danger' : 'success'}
            onClick={this.onClick}
          >
            {buttonText}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const styles = {
  dropzone: {
    height: 300,
    width: '100%',
  },
  file: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
