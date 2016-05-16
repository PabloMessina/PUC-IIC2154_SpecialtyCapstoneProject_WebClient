import React, { PropTypes } from 'react';
import { Badge } from 'react-bootstrap';
import Icon from 'react-fa';
import renderIf from 'render-if';

const Title = ({ title, icon, detail, count, style }) => (
  <h4 style={{ ...styles.container, ...style }}>
    {renderIf(icon)(() => <Icon style={styles.icon} name={icon} />)}
    {renderIf(title)(() => <span>{title}</span>)}
    {renderIf(detail)(() => <small style={styles.detail}>{detail}</small>)}
    {renderIf(count)(() => <Badge pullRight>{count}</Badge>)}
  </h4>
);

Title.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  detail: PropTypes.string,
  count: PropTypes.any,
  style: PropTypes.any,
};

export default Title;

const styles = {
  container: {

  },
  icon: {
    marginRight: 7,
    width: 25,
    textAlign: 'center',
  },
  detail: {
    marginLeft: 7,
  },
};
