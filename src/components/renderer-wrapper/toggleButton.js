import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

export default class ToggleButton extends Component {

  static get defaultProps() {
    return {
      enabled: true,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      turnedOn: true,
    };
    this.handleClick = this.handleClick.bind(this);
    this.getCurrentMessage = this.getCurrentMessage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.enabled && nextProps.enabled) {
      this.setState({
        turnedOn: true,
      });
    }
  }

  handleClick() {
    if (this.props.enabled) {
      if (this.state.turnedOn) {
        this.setState({
          turnedOn: false,
        });
        this.props.turnedOffCallback();
      } else {
        this.setState({
          turnedOn: true,
        });
        this.props.turnedOnCallback();
      }
    }
  }

  getCurrentMessage() {
    if (this.props.enabled) {
      console.log("getCurrentMessage(): turnedOn = ", this.state.turnedOn);
      return this.state.turnedOn ? this.props.turnedOnMessage :
        this.props.turnedOffMessage;
    }
    return this.props.disabledMessage;
  }

  render() {
    return (
      <Button ref="button"
        onClick={this.handleClick}
        disabled={!this.props.enabled}
      > {this.getCurrentMessage()}
      </Button>
    );
  }
}

ToggleButton.propTypes = {
  enabled: React.PropTypes.bool,
  disabledMessage: React.PropTypes.string.isRequired,
  turnedOnMessage: React.PropTypes.string.isRequired,
  turnedOffMessage: React.PropTypes.string.isRequired,
  turnedOnCallback: React.PropTypes.func.isRequired,
  turnedOffCallback: React.PropTypes.func.isRequired,
};
