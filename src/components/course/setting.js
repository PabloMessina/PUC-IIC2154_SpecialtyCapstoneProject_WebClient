import React, { Component } from 'react';
import { Row, Col, Grid, Button, Table, Panel } from 'react-bootstrap';
import Icon from 'react-fa';

import app from '../../app';
const instanceService = app.service('/instances');

export default class MinTemplate extends Component {

  static get propTypes() {
    return {
      instances: React.PropTypes.array,
    };
  }

  constructor(props) {
    super(props);
    this.state = {

    };
    this.onDeleteInstance = this.onDeleteInstance.bind(this);
  }

  onDeleteInstance(instance) {
    return instanceService.remove(instance.id).then(a => console.log(a));
  }

  render() {
    return (
      <Grid style={styles.container}>
        <Row>
          <Col xsOffset={0} xs={12} smOffset={1} sm={8}>
            <h2>Delete Course or Instances</h2>
            <p>Delete instance of a course</p>
            <Table responsive hover striped>
              <thead>
                <tr>
                  <th>Instance</th>
                  <th>Students</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
              {this.props.instances.map((instance, i) => (
                <tr key={i}>
                  <td>{instance.period}</td>
                  <td>quantity</td>
                  <td>
                    <Button bsStyle="danger" onClick={() => this.onDeleteInstance(instance)}>
                      Remove course
                    </Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </Table>
            <hr />
            <p>Delete all course</p>
            <Button bsStyle="danger" onClick={this.onDeleteCourse}>
              Remove course
            </Button>
          </Col>
          <Col xsOffset={0} xs={12} sm={3}>
            <Panel>
              <h5><Icon style={styles.icon} size="lg" name="info-circle" /> Need help?</h5>
              <hr />
              <p>Take a look at our showcase or contact us.</p>
            </Panel>
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
