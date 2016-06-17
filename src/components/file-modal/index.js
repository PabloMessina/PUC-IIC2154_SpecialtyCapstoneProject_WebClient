import React, { Component } from 'react';
import DropzoneComponent from 'react-dropzone-component/lib/react-dropzone';
import { Modal, ProgressBar, Button } from 'react-bootstrap';
import renderIf from 'render-if';
import app from '../../app';

// const SUPPORTED_FILES = {
  // image: ['jpg'],
// };
const URL = 'http://localhost:3001/api/v1/storage/';
export default class FileModal extends Component {
  static get propTypes() {
    return {
      show: React.PropTypes.bool,
      onSuccess: React.PropTypes.func,
      type: React.PropTypes.string,
    };
  }

  constructor(props) {
    super(props);


    this.state = {
      progress: 0,
      uploaded: false,
      uploading: false,
      canUpload: true,
    };

    // this.updateProgress = this.updateProgress.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.onHide = this.onHide.bind(this);
    this.onOk = this.onOk.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onUpload = this.onUpload.bind(this);
    this.onAddFile = this.onAddFile.bind(this);
  }

  onSuccess(files, { fileNames }) {
    const fileDescriptors = fileNames.map((name, i) => {
      const fileExtension = /(?:\.([^.]+))?$/.exec(files[i].name)[1];
      return { url: `${URL}${name}`, type: fileExtension };
    });
    this.setState({ files: fileDescriptors, uploading: false, uploaded: true });
  }

  onHide() {
    const { files } = this.state;
    const { onSuccess } = this.props;
    this.setState({
      uploading: false,
      uploaded: false,
    }, () => {
      this.props.onHide(() => {
        onSuccess(files);
      });
    });
  }

  onUpload() {
    this.setState({ uploading: true }, () => {
      this.dropzone.processQueue();
    });
  }

  onOk() {
    this.onHide();
  }

  onClick() {
    const { uploaded } = this.state;
    if (uploaded) {
      this.onOk();
    } else {
      this.onUpload();
    }
  }

  onAddFile() {
  }

  render() {
    const { show, multiple } = this.props;
    const { progress, canUpload, uploading, uploaded } = this.state;

    const djsConfig = {
      createImageThumbnails: false,
      autoProcessQueue: false,
      uploadMultiple: true,
      // addRemoveLinks: true,
    };

    const config = {
      postUrl: URL + 'store/',
    };

    // const success = multiple? 'successmultiple' : 'success';

    const eventHandlers = {
      // uploadprogress: this.updateProgress,
      init: (dropzone) => { this.dropzone = dropzone; },
      successmultiple: this.onSuccess,
      addedfile: this.onAddFile,
    };

    const buttonText = uploaded ? 'Ok' : 'Upload';

    return (
      <Modal show={show} onHide={this.onHide}>
        <Modal.Body>
          <DropzoneComponent
            djsConfig={djsConfig}
            eventHandlers={eventHandlers}
            config={config}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={uploading || !canUpload}
            bsStyle="success"
            onClick={this.onClick}
          >
            {buttonText}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
