import XlsxPopulate from 'xlsx-populate';
import momentTime from './momentTime.mjs';

const getFromSportlevel = () => {
  return new Promise((resolve) => {
    XlsxPopulate.fromFileAsync('./EXCEL/export.xlsx').then((workbook) => {
      const sheetSLvl = workbook // достаём значения из выгрузки Спортлевела
        .sheet(0)
        .usedRange()
        .value();

      const unicSport = [];
      const result = {};
      sheetSLvl.forEach((elem) => {
        if (elem[0] === 'MatchId') {
          // создаём шапку ["MatchId", "Day (in Europe/Moscow UTC+03:00)", "Date (in Europe/Moscow UTC+03:00)", "Game name"]
          result.head = [elem[0], elem[2], elem[3], elem[4]];
        } else if (!(typeof elem[0] === 'number')) {
          return null; // если нету Matchid - то нахер
        } else {
          if (elem[5] === 'NHL') elem[5] = 'Хоккей'; //костыль для NHL
          if (!(elem[5] in result)) {
            result[elem[5]] = [];
            unicSport.push(elem[5]);
          }
          result[elem[5]].push([
            elem[0],
            momentTime(elem[2], elem[3]),
            momentTime(elem[2], elem[3], true), // запоминаем реальное время
            elem[4],
          ]);
        }
      });
      resolve({
        sportlvl: result,
        unicSport,
      }); // возвращаем масив масивов в ключе с видом спорта, например
      // "Настольный теннис": [ [1075156, "2021-07-15T23:00:00+03:00", "2021-07-15T23:45:00+03:00", "Власов Алексей - Чахур Владислав", "Настольный теннис"]...]
    });
  });
};

export default getFromSportlevel;
