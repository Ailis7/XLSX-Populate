import XlsxPopulate from 'xlsx-populate';

const descriptor = (dateCount, pars) => {
  // сначала воткнём год в текущий массив подсчета
  let dateCountCounter = 0;

  const finalArr = [[['Дата', 'Время', 'Кол-во событий', 'Кол-во ставок']]];
  let events = 0;
  let rates = 0;

  let hours = '00';
  let prevDate = '';
  let prevRate = 0;

  const endFunc = () => {
    events += 1;
    rates += parseFloat(prevRate);
    finalArr[finalArr.length - 1].push([
      prevDate,
      `${hours}:00`,
      events,
      rates,
    ]);
  };

  for (let i = 1; i < pars.length - 1; i++) {
    if (!dateCount[dateCountCounter]) break;

    // if (typeof pars[i][0] === 'number') {
    // достаём дату и время [ "2022-04-01", "00:00:00.0000000" ]
    if (!pars[i][2]) {
      endFunc(i);
      break;
    }
    const dateAndTime = pars[i][2].split(' ');

    // сверяем с текущей датой из списка (там может быть массив)
    if (
      dateAndTime[0] === dateCount[dateCountCounter] ||
      (dateCount[dateCountCounter].some &&
        dateCount[dateCountCounter].some((elem) => elem === dateAndTime[0]))
    ) {
      // dateAndTime = ["2022-04-01", "02"]
      dateAndTime[1] = dateAndTime[1].split(':')[0];
      const [date, time] = dateAndTime;
      // пишем данные
      if (time === hours) {
        prevDate = date;
        events += 1;
        rates += parseFloat(pars[i][3]);
      } else {
        endFunc(i);

        prevDate = date;
        prevRate = pars[i][3];
        events = 0;
        rates = 0;
        // записываем текущий час
        hours = time;
      }
    } else {
      if (prevDate === '') {
        continue
      } else {
        endFunc(i);  
        prevDate = '';
        prevRate = pars[i][3];
        events = 0;
        rates = 0;
        // записываем текущий час
        hours = '00';
        finalArr.push([['Дата', 'Время', 'Кол-во событий', 'Кол-во ставок']]);
        dateCountCounter += 1;
        continue;

      }
    }
  }

  return finalArr;
};

const getFromTechProblem = ({ arr }) => {
  return new Promise((resolve) => {
    XlsxPopulate.fromFileAsync(
      './tech_problem/PB-4121_review_&_updated.xlsx',
    ).then((workbook) => {
      const techProblem = workbook.sheet(0).usedRange().value();

      const result = descriptor(arr, techProblem);

      resolve(result);
    });
  });
};

export default getFromTechProblem;
