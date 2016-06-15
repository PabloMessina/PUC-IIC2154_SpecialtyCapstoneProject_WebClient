/* eslint react/prop-types:0 */
import React from 'react';

export const Audio = (props) => (
  <audio controls src={props.blockProps.src} style={styles.media} />
);

export const Image = (props) => {
  console.log(props)
  return (
    <img src={props.blockProps.src} style={styles.media} />
  );
};

export const Video = (props) => (
  <video controls src={props.blockProps.src} style={styles.media} />
);

const styles = {
  media: {
    width: '60%',
  },
};
