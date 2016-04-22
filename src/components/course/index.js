import React, { Component } from 'react';
import { Grid, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';


export default class Course extends Component {

  static get defaultProps() {
    return {
      courses: [
        {
          courseName: 'Anatomia',
          description: 'Curso para alumnos de Ciencias de la Salud para que aprendan del cuerpo humano',
          imageSource: 'http://www.totton.ac.uk/media/183369/HUMANITIES-ICON-2_Square%20Crop.jpg',
        },
        {
          courseName: 'Salud Publica',
          description: 'Curso para alumnos de Ciencias de la Salud para que aprendan de Salud Pública',
          imageSource: 'http://www.totton.ac.uk/media/183369/HUMANITIES-ICON-2_Square%20Crop.jpg',
        },
        {
          courseName: 'Patologías',
          description: 'Curso para alumnos de Ciencias de la Salud para que aprendan de Patologías',
          imageSource: 'http://www.totton.ac.uk/media/183369/HUMANITIES-ICON-2_Square%20Crop.jpg',
        },
      ],
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
      <div className="container-fluid">
        {this.state.courses.map(course => (
          <div className="jumbotron jumbotron-fluid col-xs-12">
            <img className="col-xs-3 img-circle" src={course.imageSource} alt="no disp" />
            <div className="container col-xs-8">
              <h3 className="display-1">{course.courseName}</h3>
              <p className="lead">{course.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
Course.propTypes = {
  courses: React.PropTypes.array,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
