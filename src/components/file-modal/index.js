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
import { Colors } from '../../styles';
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
      multiple: React.PropTypes.bool,
      acceptedFiles: React.PropTypes.string,
      acceptUrl: React.PropTypes.bool,
      type: React.PropTypes.string,
      zip: React.PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      multiple: true,
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

  componentWillReceiveProps() {
    const { uploadState, files, value } = this.state;
    if (!uploadState && (files.length > 0 || value)) {
      this.setState({ uploadState: 'ready' });
    } else if (uploadState === 'ready' && files.length === 0 && !value) {
      this.setState({ uploadState: null });
    }
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
      value: '',
      uploadState: null,
    }, () => {
      if (fileUrls.length === 0) return;
      this.props.onHide(() => {
        onSuccess(fileUrls);
      });
    });
  }

  onDrop(dropped) {
    const { multiple } = this.props;
    const files = multiple ? update(this.state.files, { $push: dropped }) : [dropped[0]];
    const uploadState = files.length > 0 ? 'ready' : this.state.uploadState;
    this.setState({ files, uploadState });
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
    } else if (uploadState === 'ready') {
      this.onUpload();
    }
  }

  onRemoveFile(index) {
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
    const { show, acceptedFiles, multiple, acceptUrl } = this.props;
    const { files, value, uploadState, error } = this.state;

    let buttonDisabled = true;
    let buttonText;
    switch (uploadState) {
      case 'ready':
        buttonText = 'Upload';
        buttonDisabled = false;
        break;
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

    const urlInput = acceptUrl && files.length === 0 ? (
      <FormGroup>
        <ControlLabel>Type in an url:</ControlLabel>
        <FormControl
          type="text"
          value={value}
          placeholder="http://www.something.com/hello.png"
          onChange={this.onUrlChange}
        />
      </FormGroup>
    ) : null;

    const dropzone = !value ? (
      <Dropzone
        style={styles.dropzone}
        activeStyle={{ ...styles.dropzone, backgroundColor: Colors.withAlpha('MAIN', 0.2) }}
        rejectStyle={{ ...styles.dropzone, backgroundColor: Colors.withAlpha('RED', 0.2) }}
        accept={acceptedFiles}
        multiple={multiple}
        onDrop={this.onDrop}
        onDropRejected={this.onDropRejected}
      >
        <p>Click or drop some files!</p>
      </Dropzone>
    ) : null;

    return (
      <Modal show={show} onHide={this.onHide}>
        <Modal.Body>
          {urlInput}
          {renderIf(!error && uploadState !== 'success')(() => (
            <div>
              {renderIf(files)(() => (
                <ListGroup>
                  {files.map((file, i) => (
                    <ListGroupItem style={styles.file} key={i}>
                      {file.name}
                      <Icon name="remove" onClick={() => this.onRemoveFile(i)} />
                    </ListGroupItem>
                  ))}
                </ListGroup>
              ))}
              {dropzone}
            </div>
          ))}
          {renderIf(uploadState === 'success' && !value)(() => (
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
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 200,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  file: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
