import React, { Component } from 'react';
import { FormControls } from 'react-bootstrap';


export default class TemplateComponent extends Component {
  render() {
    return (
      <form className="form-horizontal">
        <FormControls.Static className="col-xs-10 col-xs-offset-2" value="I'm in a form" />
        <FormControls.Static label="First Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10" value="Billy" />
        <FormControls.Static label="Last Name" labelClassName="col-xs-2" wrapperClassName="col-xs-10">Bob</FormControls.Static>
      </form>
    );
  }
}
