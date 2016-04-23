import React, { Component } from 'react';
import { Grid, Tabs, Tab, Row, Col, Panel, Image, NavItem, Nav } from 'react-bootstrap';
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
      tab: 0,
    };
    this.fetch(this.props.params.organizationId);
  }

  fetch(organizationId) {
    return organizationService.get(organizationId)
      .then(organization => this.setState({ organization }));
  }

  navigationTabBar() {
    // TODO: fix highligth color and background color when stacked
    const titles = ['Courses', 'Atlases', 'Users', 'Settings'];
    return (
      <Tabs style={styles.tabs} activeKey={this.state.tab} onSelect={key => this.setState({ tab: key })}>
        {titles.map((title, i) => (
          <Tab key={i} eventKey={i} title={title}>
            <Grid style={styles.tabContent}>
              <Col xs={9}>
                <p>Content</p>
              </Col>
              <Col xs={3}>
                <Panel>
                  <h5>Looking for help?</h5>
                  <hr />
                  <p>Take a look at our showcase or contact us.</p>
                </Panel>
              </Col>
            </Grid>
          </Tab>
        ))}
      </Tabs>
    );
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

              <Row>
                <Col xs={12}>
                  {this.navigationTabBar()}
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
    height: 250, // hardcoded
    minHeight: 150,
    padding: 0,
    margin: 0,
    backgroundImage: 'url("/img/covers/default.jpg")',
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
  tabs: {
    paddingTop: 15,
  },
  tabContent: {
    marginTop: 20,
  },
};
