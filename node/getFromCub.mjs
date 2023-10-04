import XlsxPopulate from "xlsx-populate";
import moment from "moment";

const getFromCub = () => {
  return new Promise((resolve) => {
    XlsxPopulate.fromFileAsync(
      "./EXCEL/Спортлевел отчёт 1 октября.xlsx"
      // "./EXCEL/cubtest.xlsx"
    ).then((workbook) => {
      const sheetCub = workbook // достаём значения из выгрузки Куба
        .sheet(0)
        .usedRange()
        .value();

      const result = {};
      // делаем шапку
      result.head = [];
      result.head.push(sheetCub[0].slice(2));

      // далее начиная с 3 элемента парсим
      for (let i = 2; i < sheetCub.length; i += 1) {
        const currentSportArr = sheetCub[i];
        if (!currentSportArr[0]) break;
        let currentSportSpecies = currentSportArr[0].toLowerCase();
        let realSport;
        if (currentSportSpecies === 'шорт-хоккей') {
          realSport = 'шорт-хоккей';
          currentSportSpecies = 'хоккей'
        }

        if (!(currentSportSpecies in result)) result[currentSportSpecies] = [];
        // выдираем время и делаем валидный набор игроков
        const commandWithTime = currentSportArr[1]; // надо отрезать время в конце
        const replaceTime = commandWithTime.slice(
          commandWithTime.lastIndexOf("(")
        );
        let command = commandWithTime.replace(replaceTime, "").trim();

        // костылик если указали длинное тире
        command = command.replace(/—/g, '-')
        // костылик если слитно тире написано
        const commandParseRegexp = command.search(/(?<! )-(?= )|(?<= )-(?! )/g);
        if (commandParseRegexp !== -1) {
          if (command[commandParseRegexp - 1] !== " ") {
            command = command.replace("- ", " - ");
          } else {
            command = command.replace(" -", " - ");
          }
        }

        const cubObj = {
          players: command,
          time: moment(replaceTime, "(YYYY-MM-DD HH:mm:ss)"),
          financeData: currentSportArr.slice(2),
          realSport,
        };
        result[currentSportSpecies].push(cubObj);
      }
      resolve(result);
    });
  });
};

export default getFromCub;
