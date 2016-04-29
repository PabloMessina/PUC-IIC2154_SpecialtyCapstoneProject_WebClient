import React, { Component } from 'react';
import { Image } from 'react-bootstrap';
import {
  Section,
  Team,
  TeamMember,
} from 'neal-react';


export default class Dashboard extends Component {
  render() {
    const imgiOsAndroid = 'http://www.icm.church/hp_wordpress/wp-content/uploads/2015/09/app-store.png';
    return (
      <div style={styles.panel}>
        <h1 style={styles.title}>Welcome</h1>
        <div style={styles.divs}>
          <p style={styles.text}>
            This application is a recopilation of a series of Atlasses,
            with interactive content, evaluations, real time working and automatics saves.
          </p>

        </div>


        <Section style={styles.divs}>
          <Team>
            <TeamMember style={styles.image} name="Create Organizations" title="" imageUrl="https://www.colorado.gov/pacific/sites/default/files/u/1461/icon_22901.gif">
            Lorem ipsum dolor sit amet,
            consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </TeamMember>
            <TeamMember style={styles.image} name="Make Evaluations" title="" imageUrl="https://www.plannedparenthood.org/files/4814/2307/6322/planned-parenthood-online-health-services-how-does-it-work-step-3-std-testing.svg">
            Lorem ipsum dolor sit amet,
            consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </TeamMember>
            <TeamMember style={styles.image} name="Create Atlases" title="" imageUrl="http://freevector.co/wp-content/uploads/2009/03/8172-open-book-icon1.png">
            Lorem ipsum dolor sit amet,
            consectetur adipiscing elit,
            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </TeamMember>
          </Team>
        </Section>

        <Image style={styles.image} src={imgiOsAndroid} />

      </div>
    );
  }
}
const styles = {
  title: {
    textAlign: 'center',
    fontSize: 25,
    margin: 20,
  },
  panel: {
    textAlign: 'center',
    fontFamily: 'Raleway, Helvetica Neue, Helvetica, Arial, sans-serif',
  },
  image: {
    width: '25%',
    height: '8%',
  },
  text: {
    fontSize: 25,
    margin: 20,
  },
  divs: {
    marginBottom: 50,
  },
};
