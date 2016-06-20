import React, { Component } from 'react';
import DropzoneComponent from 'react-dropzone-component/lib/react-dropzone';
import { Modal, Button } from 'react-bootstrap';
import update from 'react-addons-update';

// const SUPPORTED_FILES = {
  // image: ['jpg'],
// };
const URL = 'http://files.lupi.online/api/v1/storage/';
export default class FileModal extends Component {
  static get propTypes() {
    return {
      show: React.PropTypes.bool,
      onSuccess: React.PropTypes.func,
      onHide: React.PropTypes.func,
      maxFiles: React.PropTypes.number,
      acceptedFiles: React.PropTypes.string,
      type: React.PropTypes.string,
    };
  }

  constructor(props) {
    super(props);


    this.state = {
      files: [],
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
    this.onFinishUpload = this.onFinishUpload.bind(this);
  }

  onSuccess(files, { fileNames }) {
    // We need the url and the extension of the file
    const fileDescriptors = fileNames.map((name, i) => {
      const fileExtension = /(?:\.([^.]+))?$/.exec(files[i].name)[1];
      return { url: `${URL}${name}`, type: fileExtension };
    });
    this.setState({ files: update(this.state.files, { $push: fileDescriptors }) });
  }

  onHide() {
    const { files } = this.state;
    const { onSuccess } = this.props;
    // this.dropzone.options.autoProcessQueue = false;
    this.setState({
      files: [],
      uploading: false,
      uploaded: false,
    }, () => {
      if (files.length === 0) return;
      this.props.onHide(() => {
        onSuccess(files);
      });
    });
  }

  onUpload() {
    this.setState({ uploading: true }, () => {
      // this.dropzone.options.autoProcessQueue = true;
      this.dropzone.processQueue();
    });
  }

  onFinishUpload() {
    this.setState({ uploading: false, uploaded: true });
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
    const { show, acceptedFiles, maxFiles } = this.props;
    const { canUpload, uploading, uploaded } = this.state;

    const djsConfig = {
      createImageThumbnails: false,
      autoProcessQueue: uploading,
      uploadMultiple: true,
      acceptedFiles,
      maxFiles: maxFiles || null,
      // accept: (file) => console.log(file),
      // addRemoveLinks: true,
    };

    const config = {
      postUrl: `${URL}store/`,
    };

    // const success = multiple? 'successmultiple' : 'success';

    const eventHandlers = {
      // uploadprogress: this.updateProgress,
      init: (dropzone) => { this.dropzone = dropzone; },
      successmultiple: this.onSuccess,
      addedfile: this.onAddFile,
      queuecomplete: this.onFinishUpload,
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
