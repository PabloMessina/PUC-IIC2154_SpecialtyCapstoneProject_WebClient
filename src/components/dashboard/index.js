import React, { Component, PropTypes } from 'react';
import { Grid, Row, Col, Tabs, Tab, Image } from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';
import renderIf from 'render-if';
import DocumentTitle from 'react-document-title';

import { currentUser } from '../../app';


const TABS = [{
  name: 'Academic',
  icon: 'graduation-cap ',
  path: 'academic',
}];

class Dashboard extends Component {

  static get propTypes() {
    return {
      router: PropTypes.object,
      children: PropTypes.any,
      location: PropTypes.object,
    };
  }

  constructor(props) {
    super(props);
    this.state = {

    };
    this.onTabChange = this.onTabChange.bind(this);
  }

  onTabChange(path) {
    if (path && this.selected !== path) {
      this.props.router.replace(`/dashboard/${path}`);
    }
  }

  get selected() {
    const paths = this.props.location.pathname.split('/').filter(Boolean);
    const [/* dashboard */, active] = paths;
    return active;
  }

  render() {
    const user = currentUser();

    const title = ({ name, icon }) => (
      <span><Icon style={styles.icon} name={icon} /> {name}</span>
    );

    return (
      <Grid style={styles.container}>
        <DocumentTitle title="Dashboard" />
        <Row>
          <Col xsHidden sm={2}>
            <Image style={{ padding: 20 }} src="http://placehold.it/400x400" responsive circle />
          </Col>
          <Col xs={12} sm={10}>
            <h2>Welcome {user.name}</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit,
              sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <Tabs
              style={styles.tabs}
              activeKey={this.selected}
              id="tabs"
              onSelect={this.onTabChange}
            >
              {TABS.map(({ path, ...options }, i) => <Tab key={i} eventKey={path} title={title(options)} />)}
            </Tabs>

          </Col>
        </Row>
        <Row style={{ paddingTop: 20 }}>
          {renderIf(this.props.children)(() =>
            <EasyTransition
              path={this.selected}
              initialStyle={{ opacity: 0 }}
              transition="opacity 0.1s ease-in"
              finalStyle={{ opacity: 1 }}
            >
              {this.props.children}
            </EasyTransition>
          )}
        </Row>
      </Grid>
    );
  }
}

export default withRouter(Dashboard);

const styles = {
  container: {
    marginTop: 10,
  },
  tabs: {
    marginTop: 30,
  },
};
