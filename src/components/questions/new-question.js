import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import Title from './title';
// import { Colors } from '../../styles';

export default class NewQuestion extends Component {

  static get propTypes() {
    return {
      _type: React.PropTypes.string,
      question: React.PropTypes.object,
      tags: React.PropTypes.array,
      fields: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      _type: 'tshort',
      question: {},
      tags: [],
      fields: {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      _type: this.props._type,
      question: this.props.question,
      tags: this.props.tags,
      fields: this.props.fields,
    };
  }

  render() {
    return (
      <Panel
        style={styles.container}
        header={<Title value={"New question"} />}
        collapsible
        expanded={this.state.close}
      >
        <div></div>
      </Panel>
    );
  }
}

const styles = {
  container: {
  },
};
