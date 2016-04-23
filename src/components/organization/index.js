import React, { Component } from 'react';
import { Grid, Image, Row, Col } from 'react-bootstrap';
// import { Button } from 'react-bootstrap';

import { Colors } from '../../styles';
import app from '../../app';

const organizationService = app.service('/organizations');

export default class Organization extends Component {

  static get propTypes() {
    return {
      // From react-router
      params: React.PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      organization: null,
    };
    this.fetch(this.props.params.organizationId);
  }

  fetch(organizationId) {
    return organizationService.get(organizationId)
      .then(organization => this.setState({ organization }));
  }

  render() {
    const { organization } = this.state;
    if (!organization) return <p>Loading...</p>;

    let { name, description, logo } = organization;
    logo = logo || 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-university-assets.s3.amazonaws.com/89/d0ddf06ad611e4b53d95ff03ce5aa7/360px.png';

    return (
      <Grid style={styles.container} fluid>
        <Row style={styles.header}>
          <Col xs={12}>
            <Grid style={styles.content}>
              <Row style={styles.banner}>
                <Col xsOffset={0} xs={12} smOffset={0} sm={11} style={styles.information}>
                  <Image style={styles.logo} src={logo} rounded />
                  <div style={styles.texts}>
                    <h1 style={styles.name}>{name}</h1>
                    <p style={styles.description}>{description || 'No description'}</p>
                  </div>
                </Col>
              </Row>
            </Grid>
          </Col>
        </Row>
      </Grid>
    );
  }
}

const styles = {
  container: {
    padding: 0,
  },
  content: {

  },
  header: {
    width: '100% auto',
    height: 250,
    minHeight: 150,
    padding: 0,
    margin: 0,
    backgroundImage: 'url("/img/covers/3.jpg")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundAttachment: 'fixed',
  },
  banner: {
    display: 'flex',
    height: 250,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  information: {
    display: 'flex',
    flexDirection: 'row',
    // height: 250,
  },
  texts: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: 3,
    maxHeight: 250,
  },
  name: {
    margin: 0,
    color: Colors.WHITE,
  },
  description: {
    marginTop: 7,
    color: Colors.WHITE,
    overflow: 'hidden',
  },
  logo: {
    height: 160,
    width: 160,
    minHeight: 160,
    minWidth: 160,
    marginRight: 24,
  },
};
