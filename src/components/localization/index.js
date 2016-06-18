import React, { PropTypes, Component } from 'react';

import { default as canUseDOM } from 'can-use-dom';
import { default as _ } from 'lodash';

import { GoogleMapLoader, GoogleMap, Circle, Marker } from 'react-google-maps';
import { triggerEvent } from 'react-google-maps/lib/utils';
import { Button } from 'react-bootstrap';
import app from '../../app';
const attendanceService = app.service('/attendances');

/*
 * This is the modify version of:
 * https://developers.google.com/maps/documentation/javascript/examples/event-arguments
 *
 * Add <script src="https://maps.googleapis.com/maps/api/js"></script> to your HTML to provide google.maps reference
 */
export default class GettingStarted extends Component {

  static get propTypes() {
    return {
      // participants: PropTypes.array.isRequired,
      evaluation: PropTypes.object,
    };
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      lat: -33.4994948,
      lng: -70.614809,
      studentLocations: [],
      unidentified: [],
      outOfRange: [],
      loading: false,
    };
    this.handleWindowResize = _.throttle(this.handleWindowResize, 500);
    this.getLocation = this.getLocation.bind(this);
    this.startSearch = this.startSearch.bind(this);
  }

  componentDidMount() {
    if (!canUseDOM) {
      return;
    }
    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    if (!canUseDOM) {
      return;
    }
    window.removeEventListener('resize', this.handleWindowResize);
  }

  getLocation(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    this.setState({ lat, lng });
    triggerEvent(this.googleMapComponent, 'center_changed');
    const query = {
      evaluationId: this.props.evaluation.id,
    };
    attendanceService.find({ query }).then(results => {
      const studentLocations = results.data.map(element => {
        if (element.location) {
          if (element.location.features) {
            const latitude = element.location.features[0].geometry.coordinates[0];
            const longitude = element.location.features[0].geometry.coordinates[1];
            const name = element.user.name;
            return { latitude, longitude, name };
          } else {
            const unidentified = [];
            unidentified.push(element.user.name);
            this.setState({ unidentified });
          }
        }
        return null;
      });
      this.setState({ studentLocations });
      this.setState({ loading: false });
    });
  }

  startSearch() {
    this.setState({ loading: true });
    navigator.geolocation.getCurrentPosition(this.getLocation);
  }

  handleWindowResize() {
    triggerEvent(this.googleMapComponent, 'resize');
  }

  renderMarker(element, i) {
    if (element) {
      return (
        <Marker
          key={i}
          position={{
            lat: element.latitude,
            lng: element.longitude }
          }
          title={element.name}
        />
      );
    }
    return null;
  }

  render() {
    return (
      <div>
        <Button onClick={() => this.startSearch}>
          {this.state.loading ? 'Loading' : 'Get Locations'}
        </Button>
        <hr />
        <GoogleMapLoader
          containerElement={
            <div
              {...this.props}
              style={{
                height: 270,
                width: '100%',
              }}
            />
          }
          googleMapElement={
            <GoogleMap
              ref={(map) => (this.googleMapComponent = map)}
              defaultZoom={16}
              center={{ lat: this.state.lat, lng: this.state.lng }}
              onClick={this.handleMapClick}
            >
              <Circle
                key="circle"
                center={{ lat: this.state.lat, lng: this.state.lng }}
                radius={100}
                options={{
                  fillColor: '#16a085',
                  fillOpacity: 0.3,
                  strokeColor: '#16a085',
                  strokeOpacity: 1,
                  strokeWeight: 1,
                }}
              />
              {this.state.studentLocations.map((element, i) => this.renderMarker(element, i))}
            </GoogleMap>
          }
        />
        <hr />
        <p><strong>Unidentified: </strong>{this.state.unidentified}</p>
        <p><strong>Out of Test Range: </strong>{this.state.outOfRange}</p>
        <p><strong>Hint:</strong> Place the mouse on a marker to see the name of the stundent.</p>
      </div>
    );
  }
}
