import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import ReactQuill from 'react-quill';


export default class Editor extends Component {

  static get propTypes() {
    return {
      static: React.PropTypes.bool,
    };
  }

  static get defaultProps() {
    return {
      static: false,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      text: {
        ops: [
          { insert: 'El ' },
          { insert: 'atrio izquierdo', attributes: { bold: true } },
          { insert: ', tradicionalmente conocido como ' },
          { insert: ' aurícula izquierda', attributes: { bold: true, italic: true } },
          { insert: ', es una de las cuatro cavidades del corazón. Recibe sangre oxigenada proveniente de los pulmones y la impulsa a través de la válvula mitral hacia el ventrículo izquierdo, el cual la distribuye a todo el organismo mediante la arteria aorta.' },
          { insert: '\n\n' },
          { insert: 'Para su estudio se divide en dos: ' },
          { insert: 'orejuela o auriculilla', attributes: { color: 'blue' } },
          { insert: ' y ' },
          { insert: 'aurícula propiamente', attributes: { color: 'blue' } },
          { insert: ' dicha; esta clasificación se da debido a su origen embriológico.' },
        ],
      },
    };
    this.onTextChange = this.onTextChange.bind(this);
  }

  onTextChange(value) {
    if (!this.props.static) {
      this.setState({ text: value });
    }
  }

  render() {
    const toolbar = this.props.static ? [] : ReactQuill.Toolbar.defaultItems;
    return (
      <div style={styles.container}>
        <ReactQuill
          theme="snow"
          value={this.state.text}
          readOnly={this.props.static}
          onChange={this.onTextChange}
        >

          <ReactQuill.Toolbar
            key="toolbar"
            ref="toolbar"
            items={toolbar}
          />

          <Panel key="editor" ref="editor" className="quill-contents" />

        </ReactQuill>
      </div>
    );
  }
}

const styles = {
  container: {

  },
};
