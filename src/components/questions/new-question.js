import React, {
  Component,
} from 'react';
import {
  Button,
  ButtonToolbar,
  DropdownButton,
  MenuItem,
} from 'react-bootstrap';

import renderIf from 'render-if';

import Correlation from './correlation';
import MultiChoice from './multi-choice';
import TShort from './tshort';
import TrueFalse from './true-false';

import { Colors } from '../../styles';

export default class NewQuestion extends Component {

  static get propTypes() {
    return {
      typeQuestion: React.PropTypes.string,
      question: React.PropTypes.object,
      tags: React.PropTypes.array,
      fields: React.PropTypes.object,
      style: React.PropTypes.any,
      buttonTypes: React.PropTypes.array,
      allTags: React.PropTypes.array,
      current: React.PropTypes.any,
    };
  }

  static get defaultProps() {
    return {
      typeQuestion: 'trueFalse',
      question: {},
      tags: [],
      fields: {},
      buttonTypes: ['tshort', 'multiChoice', 'correlation', 'trueFalse'],
      allTags: ['Hola, soy un tag', 'tag 2', 'tag 3', 'tag 4', 'tag 5', 'tag 6'],
      current: <TrueFalse permission={'editor'} open title={'New Question'} />,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      typeQuestion: props.typeQuestion,
      question: props.question,
      tags: props.tags,
      fields: props.fields,
      current: props.current,
    };
    this.setTypeQuestion = this.setTypeQuestion.bind(this);
    this.renderDropdownButton = this.renderDropdownButton.bind(this);
    this.selectTag = this.selectTag.bind(this);
    this.questionFactory = this.questionFactory.bind(this);
  }

  setTypeQuestion(e) {
    const options = {
      permission: 'editor',
      open: true,
      title: 'New Question',
      collapsible: false,
    };
    const typeQuestion = e.target.firstChild.data;
    this.setState({ typeQuestion });
    this.setState({ current: this.questionFactory(typeQuestion, options) });
  }

  questionFactory(_type, options) {
    debugger;
    switch (_type) {
      case 'trueFalse': return <TrueFalse {...options} />;
      case 'multiChoice': return <MultiChoice {...options} />;
      case 'tshort': return <TShort {...options} />;
      case 'correlation': return <Correlation {...options} />;
      default: return null;
    }
  }

  selectTag(e) {
    debugger;
    const tag = e.target.firstChild.data;
    const index = this.state.tags.findIndex((elem) => elem === tag);
    let tags = this.state.tags;
    if (index > -1) {
      tags.splice(index, 1);
    } else {
      tags = [...this.state.tags, tag];
    }
    this.setState({ tags });
  }

  renderDropdownButton(id, title, collection, ownCollection, onSelect) {
    return (
      <DropdownButton
        bsStyle={'default'}
        title={title}
        onSelect={onSelect}
        id={id}
      >
      {collection.map((item, i) => (
        <MenuItem
          key={i}
          eventKey={i}
          active={ownCollection && ownCollection.includes(item)}
        >
          {item}
          </MenuItem>
      ))}
      </DropdownButton>
    );
  }

  render() {
    debugger;
    return (
      <div style={styles.container}>
        <ButtonToolbar style={styles.buttonToolbar}>
          {this.renderDropdownButton(
            'dropdownQuestionType',
            this.state.typeQuestion,
            this.props.buttonTypes,
            [this.state.typeQuestion],
            this.setTypeQuestion
          )}
          {this.renderDropdownButton(
            'dropdownTags',
            'tags',
            this.props.allTags,
            this.state.tags,
            this.selectTag
          )}
          <Button>Set permission</Button>
          <Button>Attachment</Button>
        </ButtonToolbar>
        <div style={styles.question}>
          <div style={styles.tags}>
            {this.state.tags.map((tag, i) =>
              <p key={i} style={styles.tag}>{tag}</p>
            )}
          </div>
          {renderIf(this.state.current)(() => this.state.current)}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    marginTop: 10,
  },
  buttonToolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  question: {
    marginTop: 40,
  },
  tags: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  tag: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: Colors.MAIN,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 3,
    color: Colors.WHITE,
  },
};
