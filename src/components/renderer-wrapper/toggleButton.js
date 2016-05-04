import React, { Component } from 'react';

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
      currentMessage: props.turnedOnMessage,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.enabled) {
      if (this.state.turnedOn) {
        this.setState({
          currentMessage: nextProps.turnedOnMessage,
        });
      } else {
        this.setState({
          currentMessage: nextProps.turnedOffMessage,
        });
      }
    } else {
      this.setState({
        currentMessage: nextProps.disabledMessage,
      });
    }
  }

  handleClick() {
    if (this.props.enabled) {
      if (this.state.turnedOn) {
        this.setState({
          turnedOn: false,
          currentMessage: this.props.turnedOffMessage,
        });
        this.props.turnedOffCallback();
      } else {
        this.setState({
          turnedOn: true,
          currentMessage: this.props.turnedOnMessage,
        });
        this.props.turnedOnCallback();
      }
    }
  }

  render() {
    return (
      <button ref="button" onClick={this.handleClick}>
      {this.state.currentMessage}
      </button>
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
