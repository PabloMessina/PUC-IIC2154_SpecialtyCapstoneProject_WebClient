import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import Title from './title.js';
import renderIf from 'render-if';

export default class questionContainer extends Component {

  static get propTypes() {
    return {
      title: React.PropTypes.string,
      component: React.PropTypes.any,
      collapsible: React.PropTypes.bool,
      open: React.PropTypes.bool,
      tags: React.PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      title: '',
      component: null,
      collapsible: true,
      open: false,
      tags: [''],
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      component: props.component,
      collapsible: props.collapsible,
      open: props.open,
      tags: props.tags,
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick(value) {
    if (this.state.answer === value) {
      this.setState({ answer: 0 });
    } else {
      this.setState({ answer: value });
    }
  }

  render() {
    return (
      <Panel
        style={styles.container}
        header={
          <Title
            value={this.state.title}
            tags={this.state.tags}
            onClick={() => this.setState({ open: !this.state.open })}
          />
        }
        collapsible={this.props.collapsible}
        expanded={this.state.open}
      >
        {renderIf(this.state.component)(() => this.state.component)}
      </Panel>
    );
  }
}

const styles = {
  container: {
  },
};
