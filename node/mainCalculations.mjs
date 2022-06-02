import moment from 'moment';
import sportSpike from './sportSpike.mjs';
import comparison from './comparison.mjs';

const mainCalculations = (allData) => {
  return new Promise((resolve) => {
    let data = allData;
    let sportCash = null;
    // sportCash = 'Настольный теннис'; // для теста
    let commandCash = null;
    const sportsExclude = [
      // 'Counter-Strike',
      // 'MMA',
      // 'Баскетбол',
      // 'Бокс',
      // 'Водное поло',
      // 'Волейбол',
      // 'Настольный теннис',
      'Футбол',
      // 'Хоккей',
      'FIFA',
    ];

    data.cub.forEach((element) => {
      try {
        if (element[0] === 'Названия строк') {
          element.forEach((elem) => {
            if (elem !== 'Названия строк' && elem !== null)
              data.sportlvl.head.push(elem);
          });
        } else if (data.unicSport.indexOf(element[0]) !== -1) {
          sportCash = element[0]; // если есть в выгрузке спортлелва - оперделяем вид спорта для дальнейших
        } else if (sportsExclude.indexOf(element[0]) !== -1) {
          sportCash = null; // все остальные виды спорта - не смотрим
        } else if (sportCash) {
          let time = moment(element[0], 'DD.MM.YYYY HH:mm:ss', true);
          const secondTime = moment(element[0], 'DD.MM.YYYY H:mm:ss', true); // фикс для нолика у часа "15.06.2021 8:00:00", вместо такого "15.06.2021 08:00:00"
          const thirdTime = moment(element[0], 'DD.MM.YYYY', true); // фикс для отсутствия времени - "15.06.2021" значит 24:00 ночи
          if (secondTime._isValid) time = secondTime;
          if (thirdTime._isValid) time = thirdTime;

          if (!time._isValid && !secondTime._isValid) {
            // если это не время - значит сохраняем имена игроков
            commandCash = element[0];
          } else {
            // а если время - начинаем сравнение элементов, при этом игроки у нас сохранены в commandCash для куба
            for (
              let elemSlvlIndex = 0;
              elemSlvlIndex < data.sportlvl[sportCash].length;
              elemSlvlIndex++
            ) {
              const elemSlvl = data.sportlvl[sportCash][elemSlvlIndex];
              // сначала проверяем что у команд совпало время
              if (elemSlvl[1] === time.format()) {
                // настольный теннис
                // if (commandCash === elemSlvl[3])
                // записываем игроков из двух строк в кубе ("Абельмасов Игорь - Беляков Владимир") и спротлевела ("Абельмасов И. - Беляков В.")

                let cubComandArr = commandCash.toLowerCase().split(' - '); //Куб, делим по тире, и кладем двух игроков в 2 елемента масива ["Абельмасов Игорь ", "Беляков Владимир"]
                // prettier-ignore
                let sportlvlComandArr = elemSlvl[3].toLowerCase().split(' - '); // Спотлевел делаем то же -  ["Абельмасов И. ", "Беляков В."]
                if (sportCash === 'Хоккей') {
                  // костыль для хоокея, т.к. там в скобках пишут хрень
                  cubComandArr = cubComandArr.map((elem) => {
                    return elem.replace(/\s\(.*\)/, '');
                  });
                  sportlvlComandArr = sportlvlComandArr.map((elem) => {
                    return elem.replace(/\s\(.*\)/, '');
                  });
                }
                const firstCubPlayer = cubComandArr[0].trim().split(' '); // нужно убрать пробелы в конце строки ("Абельмасов Игорь ") и приводим к массиву ['Абельмасов', 'Игорь']
                // prettier-ignore
                let firstSportlvlPlayer = sportlvlComandArr[0].trim().split(' '); // аналогично для Спорлевела
                firstSportlvlPlayer = sportSpike(
                  firstSportlvlPlayer,
                  sportCash,
                ); // костыль для воляна, там может быть вот такая команда "Альянс-про - Пайп-про"
                if (
                  // сопадение первых пар - фамилия, имя
                  firstCubPlayer.every((elemName, index) => {
                    return comparison(
                      elemName,
                      firstSportlvlPlayer[index],
                      elemSlvl.realSport,
                    );
                  })
                ) {
                  const secondCubPlayer = cubComandArr[1].trim().split(' '); // теперь аналогично достаём вторую пару
                  // prettier-ignore
                  let secondSportlvlPlayer = sportlvlComandArr[1].trim().split(' '); // аналогично для Спорлевела
                  secondSportlvlPlayer = sportSpike(
                    secondSportlvlPlayer,
                    sportCash,
                  );
                  if (
                    // и проверяем вторую пару игроков
                    secondCubPlayer.every((elemName, index) => {
                      return comparison(
                        elemName,
                        secondSportlvlPlayer[index],
                        elemSlvl.realSport,
                      );
                    })
                  ) {
                    // и так, мы проверили время и игроков в обоих командах, пора пихать данные из куба в спорлевеловский масив
                    data.sportlvl[sportCash][elemSlvlIndex] = elemSlvl.concat(
                      element.slice(1, 5),
                    );
                    data.sportlvl[sportCash][elemSlvlIndex].realSport =
                      elemSlvl.realSport;

                    break;
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        console.log(e, 'ERROR');
      }
    });
    // console.log('result', result); // настольник - 264
    let keys = Object.keys(data.sportlvl);

    const addZero = (num) => (parseFloat(num) < 10 ? '0' + num : num);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== 'head') {
        data.sportlvl[keys[i]] = data.sportlvl[keys[i]].map((element) => {
          let newElem = element;
          const time = moment(newElem[2]);
          newElem[1] = `${addZero(time.date())}/${addZero(
            time.month() + 1,
          )}/${time.year()}`;
          newElem[2] = `${addZero(time.hour())}:${addZero(time.minute())}`;
          return newElem;
        });
      }
    }
    keys.push('FIFA');
    keys.push('NHL');
    keys.push('NBA 2K');
    keys.push('Баскетбол 3х3');
    if (data.sportlvl['Футбол']) {
      data.sportlvl['FIFA'] = data.sportlvl['Футбол'].filter(
        (elem) => elem.realSport === 'FIFA',
      );
      data.sportlvl['Футбол'] = data.sportlvl['Футбол'].filter(
        (elem) => elem.realSport !== 'FIFA',
      );
    }
    if (data.sportlvl['Хоккей']) {
      data.sportlvl['NHL'] = data.sportlvl['Хоккей'].filter(
        (elem) => elem.realSport === 'NHL',
      );
      data.sportlvl['Хоккей'] = data.sportlvl['Хоккей'].filter(
        (elem) => elem.realSport !== 'NHL',
      )
    }
    if (data.sportlvl['Баскетбол']) {
      data.sportlvl['NBA 2K'] = data.sportlvl['Баскетбол'].filter(
        (elem) => elem.realSport === 'NBA 2K',
      );
      data.sportlvl['Баскетбол'] = data.sportlvl['Баскетбол'].filter(
        (elem) => elem.realSport !== 'NBA 2K',
      )

      data.sportlvl['Баскетбол 3х3'] = data.sportlvl['Баскетбол'].filter(
        (elem) => elem.realSport === 'Баскетбол 3х3',
      );
      data.sportlvl['Баскетбол'] = data.sportlvl['Баскетбол'].filter(
        (elem) => elem.realSport !== 'Баскетбол 3х3',
      )
    }
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== 'head' && data.sportlvl[keys[i]] && data.sportlvl[keys[i]].length > 0) {
        data.sportlvl[keys[i]].unshift(data.sportlvl.head);
      }
    }

    resolve(data);
  });
};

export default mainCalculations;
