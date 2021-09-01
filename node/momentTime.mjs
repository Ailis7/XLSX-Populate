import moment from 'moment';

const momentTime = (date, time, real = false) => {
  const newDate = date.split('/').reverse();
  newDate[1] = parseFloat(newDate[1]) - 1; // добавляем месяц
  if (real) {
    return moment( // переобразуем и кладём с минутами
      newDate
        .concat(time.split(':')),
    )
     
      .format();
  } else {
    return moment( // переобразуем и кладём без минут
      newDate
        .concat(time.split(':')[0], '00'),
    )

      .format();
  }
};

export default momentTime;
