import XlsxPopulate from "xlsx-populate";
import momentTime from "./momentTime.mjs";
import translater from "./sportLevelTranslate/translater.mjs";

const getFromSportlevel = () => {
  return new Promise((resolve) => {
    XlsxPopulate.fromFileAsync('./EXCEL/export.xlsx').then((workbook) => {
    // XlsxPopulate.fromFileAsync("./EXCEL/SlvlTest.xlsx").then((workbook) => {
      const sheetSLvl = workbook // достаём значения из выгрузки Спортлевела
        .sheet(0)
        .usedRange()
        .value();

      const unicSport = [];
      const result = {};
      sheetSLvl.forEach((elem) => {
        if (elem[0] === "MatchId") {
          // создаём шапку ["MatchId", "Day (in Europe/Moscow UTC+03:00)", "Date (in Europe/Moscow UTC+03:00)", "Game name"]
          result.head = [elem[0], elem[2], elem[3], elem[4]];
        } else if (!(typeof elem[0] === "number")) {
          return null; // если нету Matchid - то нахер
        } else {
          let sportName = elem[5];
          let commandsNames = elem[4];

          if (sportName === "NHL") sportName = "Киберхоккей";
          if (sportName === "FIFA") sportName = "Киберфутбол";
          if (sportName === "NBA 2K") sportName = "Кибербаскетбол";
          if (
            sportName === "Киберхоккей" ||
            sportName === "Киберфутбол" ||
            sportName === "Кибербаскетбол"
          )
          commandsNames = translater(commandsNames);

          if (sportName === "Баскетбол 3х3") {
            sportName = "Баскетбол"; //костыль для Баскетбол 3х3
            elem.realSport = "Баскетбол 3х3";
          }
          // console.log(elem, 'elem')
          if (!(sportName in result)) {
            result[sportName] = [];
            unicSport.push(sportName);
          }
          const pushedElem = {
            id: elem[0],
            time: momentTime(elem[2], elem[3]),
            players: commandsNames,
            realSport: elem.realSport || null,
          };
          result[sportName].push(pushedElem);
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
