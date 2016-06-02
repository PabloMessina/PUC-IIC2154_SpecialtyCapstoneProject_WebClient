import React, { PropTypes, Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';


export default class ErrorPage extends Component {

  static get propTypes() {
    return {
      error: PropTypes.object,
      location: PropTypes.object,
      params: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    const { location, params, error } = this.props;
    let err = error;
    if (!error && location.state && location.state.error) {
      err = this.props.location.state.error;
    } else if (Number(params.number) === 404) {
      err = new Error('Route not found');
    }

    return (
      <Grid style={styles.container}>
        <Row>
          <Col xs={12}>
            <h1>Ups! We got an error</h1>
            <h3>{err.message || 'Unknown error'}</h3>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  container: {

  },
};
