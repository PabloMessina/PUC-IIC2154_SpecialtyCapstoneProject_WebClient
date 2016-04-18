import React from 'react';
import { Label } from 'react-bootstrap';

const Title = (props) => (
  <div style={styles.container}>
    <h3 style={styles.title}>{props.value}</h3>
    <div>
      {props.tags.map((tag, i) => <Label key={i} style={styles.tag}>{tag}</Label>)}
    </div>
  </div>
);

Title.propTypes = {
  value: React.PropTypes.string,
  tags: React.PropTypes.array,
};

Title.defaultProps = {
  value: '',
  tags: [],
};

const styles = {
  title: {
    fontSize: 18,
    margin: 0,
  },
  tag: {
    marginLeft: 3,
    marginRight: 3,
  },
  container: {
    padding: -5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

export default Title;
