import moment from 'moment';

const momentTime = (date, time, real = false) => {
  if (real) {
    return moment(
      date // переобразуем и кладём с минутами
        .split('/')
        .reverse()
        .concat(time.split(':')),
    )
      .subtract(1, 'months')
      .format();
  } else {
    return moment(
      date // переобразуем и кладём без минут
        .split('/')
        .reverse()
        .concat(time.split(':')[0], '00'),
    )
      .subtract(1, 'months')
      .format();
  }
};

export default momentTime;
