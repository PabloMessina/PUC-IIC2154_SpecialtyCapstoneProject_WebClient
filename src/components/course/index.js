import React, { Component } from 'react';
import { Grid, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';


export default class Course extends Component {

  constructor(props) {
    super(props);
    this.state = {
      courses: [
        {
          courseName: 'Anatomia',
          description: 'Curso para alumnos de Ciencias de la Salud para que aprendan del cuerpo humano',
          imageSource: '../../../minimed.jpg',
        },
        {
          courseName: 'Salud Publica',
          description: 'Curso para alumnos de Ciencias de la Salud para que aprendan de Salud Pública',
          imageSource: '../../../minimed.jpg',
        },
        {
          courseName: 'Patologías',
          description: 'Curso para alumnos de Ciencias de la Salud para que aprendan del Pato',
          imageSource: '../../../minimed.jpg',
        },
      ],
    };
  }

  render() {
    return (
      <div className="container-fluid">
        {this.state.courses.map(course =>
          <div className="jumbotron jumbotron-fluid col-xs-12">
            <img className="col-xs-3 img-circle" src={course.imageSource} alt="no disp" />
            <div className="container col-xs-8">
              <h3 className="display-1">{course.courseName}</h3>
              <p className="lead">{course.description}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}

/*
  See: https://facebook.github.io/react/docs/reusable-components.html#prop-validation
 */
Course.propTypes = {
  course: React.PropTypes.object,
};

/*
  See: https://facebook.github.io/react/tips/inline-styles.html
  CSS: http://www.w3schools.com/css/
 */
const styles = {
  container: {

  },
};
