import React, { Component, PropTypes } from 'react';
import {
  Panel,
} from 'react-bootstrap';
import moment from 'moment';
import renderIf from 'render-if';

export default class Progress extends Component {

  static get propTypes() {
    return {
      start: PropTypes.any,
      finish: PropTypes.any,
      current: PropTypes.any,
      total: PropTypes.any,
      interval: PropTypes.number,
      onTimeout: PropTypes.func,
    };
  }

  static get defaultProps() {
    return {
      interval: 1000,
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      diff: this.diff(props.start, props.finish) || 0,
      mode: 0,
    };
  }

  componentDidMount() {
    const interval = this.props.interval;
    this.patchTimer = setInterval(() => {
      const diff = this.state.diff - interval;
      if (diff >= 0) {
        this.setState({ diff });
      } else if (this.props.onTimeout) {
        this.setState({ diff: 0 });
        this.props.onTimeout();
      }
    }, interval);
  }

  componentWillReceiveProps(nextProps) {
    const { start, finish } = this.props;
    if (nextProps.start !== start || nextProps.finish !== finish) {
      this.setState({ diff: this.diff(nextProps.start, nextProps.finish) });
    }
  }

  componentWillUnmount() {
    clearInterval(this.patchTimer);
  }

  diff(start, finish) {
    return moment(finish).diff(start);
  }

  format(ms, mode) {
    const hour = 1000 * 60 * 60;
    const d = moment.duration(ms);
    if (mode === 2) {
      return moment.duration(ms).humanize();
    } else if (ms > hour && mode === 1) {
      return `${Math.floor(d.asHours()) + moment.utc(ms).format(':mm:ss')} hrs`;
    } else if (ms > hour) {
      return `${Math.floor(d.asHours()) + moment.utc(ms).format(':mm')} hrs`;
    } else if (mode === 1) {
      return `${moment.utc(ms).format('mm:ss')}`;
    } else {
      return `${moment.utc(ms).format('mm')} m`;
    }
  }

  formatDate(date) {
    return `${moment(date).format('DD MMMM YYYY - HH:mm')}`;
  }

  render() {
    const { diff, mode } = this.state;
    // const { start, finish } = this.props;
    const time = this.format(diff, mode);
    // const timeStart = this.formatDate(start);
    // const timeFinish = this.formatDate(finish);
    return (
      <Panel style={styles.container}>
        {renderIf(diff > 0)(() => (
          <div
            style={styles.header}
            onClick={() => this.setState({ mode: (this.state.mode + 1) % 3 })}
          >
            <h6 style={styles.remaining}>Remaining:</h6>
            <p style={styles.time}>{time}</p>
          </div>
        ))}

        {/*
        <div style={styles.row}>
          <h6>Start:</h6>
          <span>{timeStart}</span>
        </div>
        <div style={styles.row}>
          <h6>Finish:</h6>
          <span>{timeFinish}</span>
        </div>
        */}

        {renderIf(diff < 0)(() => (
          <h6 style={styles.header}>Time is over.</h6>
        ))}
      </Panel>
    );
  }
}

const styles = {
  container: {},
  remaining: {
    margin: 0,
    color: 'gray',
    fontWeight: '100',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: 30,
    paddingTop: 5,
    cursor: 'pointer',
  },
  time: {},
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
  },
};
