import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Icon, { IconStack } from 'react-fa';

export default class ToggleButton extends Component {

  constructor(props) {
    super(props);
    this.state = {
      turnedOn: true,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
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

  render() {
    const { turnedOn } = this.state;
    const { turnedOnIcon, turnedOffIcon, buttonStyle, iconStyle } = this.props;
    return (
      <Button
        onClick={this.handleClick}
        bsSize="small"
        style={buttonStyle}
      >
        <IconStack size="2x">
          <Icon name="circle" stack="2x"/>
          <Icon name={turnedOn ? turnedOnIcon : turnedOffIcon} stack="1x" style={iconStyle} />
        </IconStack>
      </Button>
    );
  }
}

ToggleButton.propTypes = {
  turnedOnIcon: React.PropTypes.string.isRequired,
  turnedOffIcon: React.PropTypes.string.isRequired,
  turnedOnCallback: React.PropTypes.func.isRequired,
  turnedOffCallback: React.PropTypes.func.isRequired,
  buttonStyle: React.PropTypes.object.isRequired,
  iconStyle: React.PropTypes.object.isRequired,
};
