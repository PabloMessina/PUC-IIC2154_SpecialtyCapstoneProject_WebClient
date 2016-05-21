import moment from 'moment';

export function formatMs(ms) {
  if (!ms) return null;
  return moment.utc(ms).format('HH:mm');
}

export function calculateDuration({ duration, startAt, finishAt }) {
  if (typeof duration === 'number' && duration > 0) {
    return formatMs(duration);
  } else if (startAt && finishAt) {
    return formatMs(moment(finishAt).diff(startAt));
  } else {
    return null;
  }
}
