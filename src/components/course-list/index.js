import React, { Component } from 'react';
import { Media } from 'react-bootstrap';
import renderIf from 'render-if';
import { browserHistory } from 'react-router';


export default class CourseList extends Component {

  static get propTypes() {
    return {
      courses: React.PropTypes.array,
    };
  }

  static get defaultProps() {
    return {
      courses: [],
    };
  }

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  onClick(courseId) {
    const url = `/courses/show/${courseId}`;
    return browserHistory.push(url);
  }

  renderRow(course) {
    return (
      <div key={course.id}>
        <Media style={styles.cell}>
          <Media.Left>
            <img
              style={{ cursor: 'pointer' }}
              width={70}
              height={70}
              onClick={() => this.onClick(course.id)}
              src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-university-assets.s3.amazonaws.com/89/d0ddf06ad611e4b53d95ff03ce5aa7/360px.png"
              alt="Not available"
            />
          </Media.Left>
          <Media.Body>
            <Media.Heading style={{ cursor: 'pointer' }}>
              <span onClick={() => this.onClick(course.id)}>{course.name}</span>
            </Media.Heading>
            <p>{course.description}</p>
          </Media.Body>
        </Media>
        <hr />
      </div>
    );
  }

  render() {
    return (
      <div style={styles.container}>

        {renderIf(this.props.courses.length === 0)(() => (
          <p>No courses</p>
        ))}

        {this.props.courses.map(this.renderRow)}

      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
  cell: {
    marginTop: 20,
    marginBottom: 20,
    paddingRight: 8,
  },
};
