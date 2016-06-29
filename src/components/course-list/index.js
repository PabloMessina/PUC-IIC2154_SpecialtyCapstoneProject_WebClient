import React, { PropTypes } from 'react';
import { Media } from 'react-bootstrap';
import renderIf from 'render-if';
import { Link, withRouter } from 'react-router';
import Icon from 'react-fa';


const Row = ({ course, ...props }) => {
  const url = `/courses/show/${course.id}`;
  return (
    <div key={course.id} {...props}>
      <Media style={styles.cell}>
        <Media.Left>
          <Link to={url}>
          {course.organization.logo ? (
            <img
              style={styles.logo}
              width={70}
              height={70}
              src={course.organization.logo}
              alt={`${course.name} logo`}
            />
          ) : (
            <Icon name="folder-open" size="4x" style={{ marginRight: 10 }} />
          )}
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
};

Row.propTypes = {
  course: PropTypes.object,
};

const CourseList = ({ courses, ...props }) => (
  <div style={styles.container} {...props}>
    {renderIf(courses.length === 0)(() => (
      <p>No courses</p>
    ))}
    {courses.map(course => <Row key={course.id} course={course} />)}
  </div>
);

CourseList.propTypes = {
  courses: PropTypes.array.isRequired, // must have organization object
  router: PropTypes.object,
};

CourseList.defaultProps = {
  courses: [],
};

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
  logo: {
    objectFit: 'contain',
  },
};

export default withRouter(CourseList);
