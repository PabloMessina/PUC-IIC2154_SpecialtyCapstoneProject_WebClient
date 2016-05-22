import React, { Component } from 'react';
import { Grid, Tabs, Tab, Row, Col, Image } from 'react-bootstrap';
import Icon from 'react-fa';
import { withRouter } from 'react-router';
import EasyTransition from 'react-easy-transition';

import app, { currentUser } from '../../app';
const membershipService = app.service('/memberships');

import { Colors } from '../../styles';

const TABS = [{
  name: 'Courses',
  icon: 'graduation-cap ',
  path: 'courses',
}, {
  name: 'Atlases',
  icon: 'book',
  path: 'atlases',
}, {
  name: 'Members',
  icon: 'user',
  path: 'members',
}, {
  name: 'Settings',
  icon: 'cog',
  path: 'settings',
}];

class Organization extends Component {

  static get propTypes() {
    return {
      // From react-router
      router: React.PropTypes.any,
      params: React.PropTypes.object,
      children: React.PropTypes.any,
      location: React.PropTypes.any,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      organization: props.params.organization,
      membership: {},
    };
    this.renderNavigationTabBar = this.renderNavigationTabBar.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }

  componentDidMount() {
    this.fetchMembership(this.state.organization.id);
  }

  componentWillReceiveProps(nextProps) {
    // Because router onEnter is not called when navigation between childrens.
    const organization = nextProps.params.organization;
    if (organization && organization.id !== this.state.organization.id) {
      this.setState({ organization });
      this.fetchMembership(organization.id);
    }
  }

  onTabChange(path) {
    if (path && this.activeTab !== path) {
      const organization = this.state.organization;
      this.props.router.replace(`/organizations/show/${organization.id}/${path}`);
    }
  }

  fetchMembership(organizationId) {
    const query = {
      organizationId,
      userId: currentUser().id,
      $limit: 1,
    };
    return membershipService.find({ query })
      .then(result => result.data[0])
      .then(membership => this.setState({ membership, error: null }))
      .catch(error => this.setState({ error }));
  }

  get activeTab() {
    const paths = this.props.location.pathname.split('/').filter(Boolean);
    const [/* organizations */, /* show */, /* :id */, active] = paths;
    return active;
  }

  renderNavigationTabBar() {
    const { membership } = this.state;
    const title = ({ name, icon }) => (
      <span><Icon style={styles.icon} name={icon} /> {name}</span>
    );

    const tabs = membership.permission === 'admin'
      ? TABS
      : TABS.filter(t => !['settings', 'questions'].includes(t.path));

    return (
      <Tabs
        style={styles.tabs}
        activeKey={this.activeTab}
        id="tabs"
        onSelect={this.onTabChange}
      >
        {tabs.map(({ path, ...options }, i) => (
          <Tab key={i} eventKey={path} title={title(options)} />
        ))}
      </Tabs>
    );
  }

  render() {
    const { organization, membership } = this.state;
    const { name, description } = organization;
    const logo = 'https://coursera-university-assets.s3.amazonaws.com/89/d0ddf06ad611e4b53d95ff03ce5aa7/360px.png';
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
                  {this.renderNavigationTabBar()}
                  <div style={styles.tabContent}>
                    <EasyTransition
                      path={this.activeTab}
                      initialStyle={{ opacity: 0 }}
                      transition="opacity 0.1s ease-in"
                      finalStyle={{ opacity: 1 }}
                    >
                      {React.cloneElement(this.props.children, { organization, membership })}
                    </EasyTransition>
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

export default withRouter(Organization);

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
  icon: {
    marginRight: 4,
  },
};
