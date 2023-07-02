import XlsxPopulate from "xlsx-populate";
import glossarySports from "./glossarySports.mjs";
const folderName = './EXCEL/June betradar/'

const getBetradar = () => {
  return new Promise((resolve) => {
    XlsxPopulate.fromFileAsync(
      `${folderName}Betradar-main.xlsx`
    ).then((workbookBetradar) => {
      const sheetBetradar = workbookBetradar // главная выгрузка бетрадара
        .sheet(0)
        .usedRange()
        .value();

      XlsxPopulate.fromFileAsync(
        `${folderName}Trader-data.xlsx`
      ).then((workbookTarder) => {
        const dataById = {};
        const sportCounter = {};

        // Первый раз преобразуем исходный главный объект в вид "по id" {12123: [...]}
        for (let i = 0; i < sheetBetradar.length; i += 1) {
          const currentElem = sheetBetradar[i];
          if (i !== 0) {
            if (sportCounter[currentElem[4]]) {
              sportCounter[currentElem[4]] += 1;
            } else {
              sportCounter[currentElem[4]] = 1;
            }
            currentElem[0] = currentElem[0].replace("sr:match:", "");
            currentElem[8] = null;
            currentElem[9] = null;
            dataById[currentElem[0]] = currentElem;
          } else {
            currentElem[9] = "Комментарий LS";
            currentElem[10] = "Текст письма";
            dataById.header = currentElem;
          }
        }

        const sheetTrader = workbookTarder // Выгрузка трейдера с матчами где есть ставки
          .sheet(0)
          .usedRange()
          .value();
        // теперь массив где по матчу была хоть одна ставка - удалем эти значения из исходного
        for (let i = 1; i < sheetTrader.length; i += 1) {
          const idToExclude = sheetTrader[i][3];
          if (dataById[idToExclude]) delete dataById[idToExclude];
        }

        const sportNames = glossarySports.getEngNamesByArr();
        const idLoadBySportsName = [];

        const promisesFilesLoad = [];
        for (let i = 0; i < sportNames.length; i += 1) {
          const promise = XlsxPopulate.fromFileAsync(
            `${folderName}выгрузки по видам спорта/${sportNames[i]}.xlsx`
          ).then((workbookBySport) => {
            const sheet = workbookBySport // по спортам
              .sheet(0)
              .usedRange()
              .value();
            for (let x = 0; x < sheet.length; x += 1) {
              if (x !== 0) idLoadBySportsName.push(sheet[x][18]);
            }
          });
          promisesFilesLoad.push(promise);
        }
        Promise.all(promisesFilesLoad).then(() => {
          for (let i = 0; i < idLoadBySportsName.length; i += 1) {
            if (dataById[idLoadBySportsName[i]]) {
              if (dataById[idLoadBySportsName[i]][9] === null) {
                dataById[idLoadBySportsName[i]][9] =
                  "Есть в Трейдере, нет ставок по матчу";
              } else {
                dataById[idLoadBySportsName[i]][9] =
                  "ЧТО-ТО ПОШЛО НЕ ТАК на этапе по спортам!";
              }
            }
          }
          XlsxPopulate.fromFileAsync(
            `${folderName}Hidden events.xlsx`
          ).then((workbookHiddenEvents) => {
            const sheetHiddenEvents = workbookHiddenEvents // по скрытым событиям
              .sheet(0)
              .usedRange()
              .value();

            const hiddenEventsId = [];
            for (let i = 1; i < sheetHiddenEvents.length; i += 1) {
              hiddenEventsId.push(sheetHiddenEvents[i][18]);
            }

            for (let i = 0; i < hiddenEventsId.length; i += 1) {
              if (dataById[hiddenEventsId[i]]) {
                if (dataById[hiddenEventsId[i]][9] === null) {
                  dataById[hiddenEventsId[i]][9] =
                    "Есть в Трейдере в скрытых событиях";
                } else {
                  dataById[hiddenEventsId[i]][9] =
                    "ЧТО-ТО ПОШЛО НЕ ТАК на этапе скрытых!";
                }
              }
            }

            const keysMainData = Object.keys(dataById);
            for (let i = 0; i < keysMainData.length; i += 1) {
              if (keysMainData[i] !== "header") {
                if (dataById[keysMainData[i]][9] === null) {
                  dataById[keysMainData[i]][9] = "Нет в Трейдере и в отчёте QS";
                }
              }
            }

            XlsxPopulate.fromFileAsync(
              `${folderName}Notifications.xlsx`
            ).then((workbookNotifications) => {
              const sheetNotifications = workbookNotifications // по уведомлениям
                .sheet(0)
                .usedRange()
                .value();

              for (let i = 1; i < sheetNotifications.length; i += 1) {
                const matchId = sheetNotifications[i][1];
                if (dataById[matchId]) {
                  const text = sheetNotifications[i][13];
                  if (dataById[matchId][10]) {
                    dataById[matchId][10] = `${dataById[matchId][10]}\n${text}`;
                  } else {
                    dataById[matchId][10] = text;
                  }
                }
              }

              XlsxPopulate.fromFileAsync(
                `${folderName}In-running support.xlsx`
              ).then((workbookOutlook) => {
                const sheetOutlook = workbookOutlook // главная выгрузка бетрадара
                  .sheet(0)
                  .usedRange()
                  .value();

                const parseOutlook = [];
                const matchIdRegex = /(Match-ID:\s)(\d+)/;
                const messageRegex = /(\d+)\)\s(.*)/;
                for (let i = 1; i < sheetOutlook.length; i += 1) {
                  const str = sheetOutlook[i][0];

                  if (str?.match) {
                    const checkId = str.match(matchIdRegex);
                    const checkMes = str.match(messageRegex);

                    if (checkId && checkId[2]) {
                      const matchId = checkId[2];
                      let message;
                      if (checkMes && checkMes[2]) {
                        message = checkMes[2];
                      } else {
                        message = sheetOutlook[i + 3][0];
                        i += 3;
                      }
                      parseOutlook.push([matchId, message]);
                    }
                  }
                }

                for (let i = 0; i < parseOutlook.length; i += 1) {
                  const matchId = parseOutlook[i][0];
                  if (dataById[matchId]) {
                    const text = parseOutlook[i][1];
                    if (dataById[matchId][10]) {
                      dataById[
                        matchId
                      ][10] = `${dataById[matchId][10]}\n${text}`;
                    } else {
                      dataById[matchId][10] = text;
                    }
                  }
                }

                // распарcиваем в массив массивов и передаём на запись в файл
                const dataToWrite = [dataById.header];
                delete dataById.header;
                for (let i = 0; i < keysMainData.length; i += 1) {
                  dataToWrite.push(dataById[keysMainData[i]]);
                }

                const sportCounterToWrite = [];
                const keysCounter = Object.keys(sportCounter);
                for (let i = 0; i < keysCounter.length; i += 1) {
                  sportCounterToWrite.push([
                    keysCounter[i],
                    sportCounter[keysCounter[i]],
                  ]);
                }
                resolve({ dataToWrite, sportCounterToWrite });
              });
            });
          });
        });
      });
    });
  });
};

export default getBetradar;
