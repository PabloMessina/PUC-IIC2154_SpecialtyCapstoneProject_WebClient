import React, { Component } from 'react';
import { Media } from 'react-bootstrap';
import renderIf from 'render-if';
import { Link, withRouter } from 'react-router';


class CourseList extends Component {

  static get propTypes() {
    return {
      courses: React.PropTypes.array,
      router: React.PropTypes.object,
    };
  }

  static get defaultProps() {
    return {
      courses: [],
    };
  }

  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
  }

  renderRow(course) {
    const url = `/courses/show/${course.id}`;
    return (
      <div key={course.id}>
        <Media style={styles.cell}>
          <Media.Left>
            <Link to={url}>
              <img
                style={{ cursor: 'pointer' }}
                width={70}
                height={70}
                onClick={() => this.onClick(course)}
                src="https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-university-assets.s3.amazonaws.com/89/d0ddf06ad611e4b53d95ff03ce5aa7/360px.png"
                alt="Not available"
              />
            </Link>
          </Media.Left>
          <Media.Body>
            <Media.Heading>
              <Link to={url}>
                {course.name}
              </Link>
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

export default withRouter(CourseList);
