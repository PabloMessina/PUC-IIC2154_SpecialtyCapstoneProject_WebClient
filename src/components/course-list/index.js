import React, { Component } from 'react';
import { Media } from 'react-bootstrap';
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
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(courseId) {
    const url = `/courses/show/${courseId}`;
    return browserHistory.push(url);
  }

  render() {
    return (
      <div style={styles.container}>
      {this.props.courses.map((course, i) => (
        <Media key={i} style={styles.cell}>
          <Media.Left>
            <img
              style={{ cursor: 'pointer' }}
              width={70}
              height={70}
              onClick={() => this.handleClick(course.id)}
          /*  src={course.imageSource} */
              src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-university-assets.s3.amazonaws.com/89/d0ddf06ad611e4b53d95ff03ce5aa7/360px.png"
              alt="Not available"
            />
          </Media.Left>
          <Media.Body>
            <Media.Heading
              style={{ cursor: 'pointer' }}
              onClick={() => this.handleClick(course.id)}
            >
            {course.name}
            </Media.Heading>
            <p>{course.description}</p>
          </Media.Body>
        </Media>
        ))}
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
    marginTop: 10,
    paddingRight: 8,
  },
};
