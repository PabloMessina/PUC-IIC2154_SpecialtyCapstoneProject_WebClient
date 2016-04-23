import React, { Component } from 'react';
import { Grid, Col, ListGroup, ListGroupItem } from 'react-bootstrap';


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
    this.state = {
      courses: props.courses,
    };
  }

  render() {
    return (
      <Grid style={styles.container}>
        {this.state.courses.map(course => (
          <div className="jumbotron jumbotron-fluid col-xs-12">
            <img className="col-xs-3 img-circle" src={course.imageSource} alt="no disp" />
            <div className="container col-xs-8">
              <h3 className="display-1">{course.courseName}</h3>
              <p className="lead">{course.description}</p>
            </div>
          </div>
        ))}
      </Grid>
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
};
