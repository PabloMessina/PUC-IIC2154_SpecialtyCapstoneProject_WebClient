import React from 'react';
import { Label } from 'react-bootstrap';

const Title = (props) => (
  <div style={styles.container}>
    <h3 style={styles.title}>Pregunta {props.number}</h3>
    <div>
      {props.tags.map((tag, i) => <Label key={i} style={styles.tag}>{tag}</Label>)}
    </div>
  </div>
);

Title.propTypes = {
  number: React.PropTypes.number,
  tags: React.PropTypes.array,
};

Title.defaultProps = {
  number: 0,
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
