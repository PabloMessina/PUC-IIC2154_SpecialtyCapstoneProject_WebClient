import React from 'react';
import { Label, Button } from 'react-bootstrap';
import renderIf from 'render-if';

const Title = (props) => (
  <div style={styles.container} onClick={props.onClick}>
    <h3 style={styles.title}>{props.value}</h3>
    <div style={styles.others}>
      {renderIf(props.tags.length > 0)(() =>
        props.tags.map((tag, i) => <Label key={i} style={styles.tag}>{tag}</Label>)
      )}
      {renderIf(props.buttons.length > 0)(() =>
        props.buttons.map((item, i) =>
          <Button
            key={i}
            onClick={item.onClick}
            style={Object.assign({},
         item.style, styles.tag)}
          >
            {item.text}
          </Button>)
      )}
    </div>
  </div>
);

Title.propTypes = {
  value: React.PropTypes.string,
  buttons: React.PropTypes.array,
  tags: React.PropTypes.array,
  onClick: React.PropTypes.func,
};

Title.defaultProps = {
  value: '',
  tags: [],
  buttons: [],
};

const styles = {
  title: {
    fontSize: 18,
    margin: 0,
  },
  tag: {
    marginLeft: 3,
    marginRight: 3,
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    padding: -5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  others: {
    display: 'flex',
    flexDirection: 'row',
  },
};

export default Title;
