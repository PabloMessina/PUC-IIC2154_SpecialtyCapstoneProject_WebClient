import React, { Component } from 'react';
import DropzoneComponent from 'react-dropzone-component/lib/react-dropzone';
import { Modal, ProgressBar, Button } from 'react-bootstrap';
import renderIf from 'render-if';
import app from '../../app';

// const SUPPORTED_FILES = {
  // image: ['jpg'],
// };
const URL = 'http://localhost:3001/api/v1/storage/store/'
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
  }

  updateProgress(file, progress) {
    this.setState({ progress });
  }

  onSuccess(file, { fileNames }) {
    this.props.onSuccess({ uri: URL + fileNames[0] });
    this.setState({ progress: 0 });
  }

  render() {
    const { show, multiple } = this.props;
    const { progress } = this.state;
    const djsConfig = {
      //addRemoveLinks: true,
    };

    const eventHandlers = {
      uploadprogress: this.updateProgress,
      success: this.onSuccess,
    };

    return (
      <Modal show={show} onHide={this.props.onHide}>
        <Modal.Body>
          <DropzoneComponent
            ref={(dropzone) => { this.dropzone = dropzone; }}
            djsConfig={djsConfig}
            eventHandlers={eventHandlers}
            config={{ postUrl: URL }}
          />
          {renderIf(progress && progress > 0)(() => (
            <ProgressBar
              now={progress}
              label={`${progress}%`}
            />
          ))}
        </Modal.Body>
      </Modal>
    );
  }

}
