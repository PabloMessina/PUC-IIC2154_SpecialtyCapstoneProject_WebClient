import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import throttle from 'lodash/throttle';
import isEqual from 'lodash/isEqual';

import app from '../../app';
const timeService = app.service('/time');

export function withTimeSyncronizer(options) {
  return function compose(ComposedComponent) {
    return class Syncronizer extends Component {

      static propTypes = {
        ...ComposedComponent.propTypes,
        onError: PropTypes.func,
        // In milliseconds
        interval: PropTypes.number.isRequired,
        // [0, 1]
        tolerance: PropTypes.number.isRequired,
        // ticks
        ticks: PropTypes.number,
      }

      static defaultProps = {
        interval: 1 * 1000,
        tolerance: 0.2,
        ticks: Infinity,
        ...options,
      }

      state = {
        // difference between local and server in milliseconds
        diff: null,
        // Last time we asked the local time
        lastChecked: null,
        // Times the check method has ran
        counter: 0,
      }

      componentDidMount() {
        this.fetchTime();
        this.timer = setInterval(this.checkTime, this.props.interval);
      }

      componentWillReceiveProps(nextProps) {
        if (this.props.interval !== nextProps.interval) {
          clearInterval(this.timer);
          this.timer = setInterval(this.checkTime, nextProps.interval);
        }
      }

      shouldComponentUpdate(nextProps, nextState) {
        if (!this.state.diff && nextState.diff) return true;
        else if (this.state.counter === 0) return true;
        else if (!isEqual(this.props, nextProps)) return true;
        else return false;
      }

      componentWillUnmount() {
        clearInterval(this.timer);
      }

      checkTime = () => {
        const { tolerance, interval, ticks } = this.props;
        const { lastChecked, counter } = this.state;

        // const difference = now.diff(lastChecked);
        const epsilon = interval * (1 + tolerance);

        const bottom = moment().subtract(epsilon);
        const upper = moment().add(epsilon);

        // console.log('upper', upper.format());
        // console.log('bottom', bottom.format());
        // console.log('now', lastChecked.format());

        if (lastChecked.isBetween(bottom, upper)) {
          // it's ok
          this.setState({ lastChecked: moment(), counter: (counter + 1) % ticks });
        } else {
          // something has changed
          this.throttledFetchTime(); // TODO: what happens if fetchTimes takes longer than the interval?
        }
      }

      fetchTime = () => timeService.get('now')
        .then(date => {
          const local = moment();
          const server = moment(date.now);
          const diff = server.diff(local);

          this.setState({ diff, lastChecked: local });
          return server;
        })
        .catch(error => {
          if (this.props.onError) this.props.onError(error);
          else throw error;
        });

      // Solves: What happens if fetchTimes takes longer than the interval?
      throttledFetchTime = throttle(this.fetchTime, 5000)

      getTime = () => moment().add(this.state.diff)

      render() {
        const { diff, lastChecked } = this.state;
        if (diff && lastChecked) {
          return <ComposedComponent getTime={this.getTime} {...this.props} />;
        } else {
          return null;
        }
      }
    };
  };
}
