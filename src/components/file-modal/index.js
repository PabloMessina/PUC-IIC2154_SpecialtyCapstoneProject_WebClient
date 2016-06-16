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
    };

    this.updateProgress = this.updateProgress.bind(this);
    this.onSuccess = this.onSuccess.bind(this);
    this.onHide = this.onHide.bind(this);
  }

  onSuccess(file, { fileNames }) {
    this.props.onSuccess(URL + fileNames[0]);
    this.setState({ progress: 0 });
  }

  updateProgress(file, progress) {
    this.setState({ progress });
  }

  onHide() {
    this.setState({ progress: 0 }, () => {
      this.props.onHide();
    });
  }

  render() {
    const { show, multiple } = this.props;
    const { progress } = this.state;
    const djsConfig = {
      createImageThumbnails: true,
      // addRemoveLinks: true,
    };

    const eventHandlers = {
      uploadprogress: this.updateProgress,
      success: this.onSuccess,
    };

    const buttonDisabled = progress < 100;
    return (
      <Modal show={show} onHide={this.onHide}>
        <Modal.Body>
          <DropzoneComponent
            ref={(dropzone) => { this.dropzone = dropzone; }}
            djsConfig={djsConfig}
            eventHandlers={eventHandlers}
            config={{ postUrl: URL + 'store/' }}
          />
        </Modal.Body>
        <Modal.Footer>
          {renderIf(progress && progress > 0)(() => (
            <ProgressBar
              now={progress}
              label={`${progress}%`}
            />
          ))}

          <Button
            disabled={buttonDisabled}
            bsStyle="success"
            onClick={this.onHide}
          >
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

}
