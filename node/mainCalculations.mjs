import stringComparison from "string-comparison";
import { getCommandArrFromDB } from "../dataBase/index.mjs";

const dbParser = (cubcommand, dbCommand, slvlRealCommand) => {
  if (dbCommand) {
    const dbParseResult = dbCommand.find(
      (dbElem) => dbElem.commandname === cubcommand
    )?.commandname;
    return dbParseResult ? slvlRealCommand : cubcommand;
  }
  return cubcommand;
};

const parserTennis = (elem) => {
  let trimElem = elem.trim();
  let newIndex = 0;

  if (trimElem.indexOf(". мл.") !== -1) {
    // trimElem = trimElem.replace(/.мл./, ". мл.");
    newIndex -= 1;
  }
  if (trimElem.indexOf(". ст.") !== -1) {
    // trimElem = trimElem.replace(/.ст./, ". ст.");
    newIndex -= 1;
  }
  return {
    elem: trimElem.split(" "),
    index: trimElem.split(" ").length - 1 + newIndex,
  };
};

const cutFunc = (command) => {
  let parse;
  try {
    parse = command.split(" (");
  } catch (e) {
    console.log(e);
  }

  if (parse.length === 5) {
    const memory = parse[2].split(" - ");
    parse = `${parse[0]} (${parse[1]} - ${memory[1]} (${parse[3]}`;
  } else {
    parse = command;
  }
  return parse;
};

function removeValuesInBrackets(commands) {
  const result = commands
    .split(" - ")
    .map((elem) => {
      const regex = /\((мол|до 19|до 20|до 21|ж)\)/g;
      let savedAge;
      const newStr = elem.replace(regex, (match, group) => {
        savedAge = `${group}`;
        return "";
      });
      return (
        newStr.replace(/\s\(.*\)/, "").trim() +
        (savedAge ? (savedAge === "(ж)" ? "(ж)" : " (мол)") : "")
      );
    })
    .join(" - ");

  return result.replace(/хк/g, "");
}

const estimation = (cubCo, slvlCo) => {
  const arrCubCo = cubCo.split(" - ").map((e) => e.split(" "));
  const arrSlvlCo = slvlCo.split(" - ").map((e) => e.split(" "));

  const c1 = arrCubCo[0];
  const c2 = arrCubCo[1];
  const s1 = arrSlvlCo[0];
  const s2 = arrSlvlCo[1];

  let success = false;
  for (let i = 0; i < c1.length; i += 1) {
    if (c1[i] === "ж" || c1[i] === "мол" || c1[i] === "д") continue;
    s1.forEach((elem) => {
      if (elem === c1[i]) success = true;
    });
  }
  if (success) {
    for (let i = 0; i < c2.length; i += 1) {
      if (c2[i] === "ж" || c2[i] === "мол" || c2[i] === "д") continue;
      s2.forEach((elem) => {
        if (elem === c2[i]) success = "win";
      });
    }
  }
  return success === "win";
};

const Comparison = stringComparison.levenshtein;

const mainCalculations = (data) => {
  return new Promise(async (resolve) => {
    const allData = data;

    // виды спорта, ключи спортлевела
    const slvlKeys = Object.keys(allData.sportlvl);
    //начинаем
    try {
      for (
        let sportlvlKey = 0;
        sportlvlKey < slvlKeys.length;
        sportlvlKey += 1
      ) {
        const currentSlvlSportSpecies = slvlKeys[sportlvlKey];
        if (
          currentSlvlSportSpecies === "head" ||
          !allData.cub[currentSlvlSportSpecies]
        )
          continue; // пропускаем шапку и если нет таких видов спорта в кубе
        const currentSlvlSportArr = allData.sportlvl[currentSlvlSportSpecies];

        for (
          let currentSlvlIndexElem = 0;
          currentSlvlIndexElem < currentSlvlSportArr.length;
          currentSlvlIndexElem += 1
        ) {
          const inSlvlArr = currentSlvlSportArr[currentSlvlIndexElem];
          const cubContentForSearch = allData.cub[currentSlvlSportSpecies];

          // slvlBlock
          let sportlvlCommand = inSlvlArr.players.toLowerCase();
          if (currentSlvlSportSpecies === "Волейбол") {
            sportlvlCommand = sportlvlCommand.replace(/-про/g, " про");
            sportlvlCommand = removeValuesInBrackets(sportlvlCommand);
          }
          if (currentSlvlSportSpecies === "Хоккей" && !inSlvlArr.realSport) {
            sportlvlCommand = removeValuesInBrackets(sportlvlCommand);
          }
          sportlvlCommand = cutFunc(sportlvlCommand).replace(/\(|\)/g, "");

          const sportlvlPlayers = sportlvlCommand.split(" - ");

          const DBcubPlayersFirst = await getCommandArrFromDB(
            sportlvlPlayers[0]
          );
          const DBcubPlayersSecond = await getCommandArrFromDB(
            sportlvlPlayers[1]
          );

          // end SlvlBlock

          for (
            let cubElementIndex = 0;
            cubElementIndex < cubContentForSearch.length;
            cubElementIndex += 1
          ) {
            const cubElement = cubContentForSearch[cubElementIndex];

            let idealTime = false;

            const diffInMinutes = inSlvlArr.time.diff(
              cubElement.time,
              "minutes"
            );
            if (diffInMinutes === 0) idealTime = true;
            // пилим проверку +\- 1 час от реального времени!, тут уже нет прямого совпадения
            if (!(diffInMinutes <= 60 && diffInMinutes >= -60)) continue; // если больше

            let cubCommand = cubElement.players.toLowerCase();
            if (cubCommand.match(/^есть совпадение с -/g) !== null) continue;

            if (currentSlvlSportSpecies === "Настольный теннис") {
              let indexOne, indexTwo;
              let [firstSlvl, secondSlvl] = sportlvlCommand
                .split("-")
                .map((e) => parserTennis(e).elem);

              let [firstCub, secondCub] = cubCommand
                .split(" - ")
                .map((e, i) => {
                  const { elem, index } = parserTennis(e);
                  if (i === 0) indexOne = index;
                  if (i === 1) indexTwo = index;
                  return elem;
                });
              if (firstSlvl[indexOne]?.[0] === firstCub[indexOne]?.[0]) {
                // проверка на двойное имя - Корп Петр Оливер (в кубе: "Корп П.О.")
                firstCub[indexOne] = firstSlvl[indexOne + 1]
                  ? `${firstSlvl[indexOne]} ${firstSlvl[indexOne + 1]}`
                  : firstSlvl[indexOne];
              }
              if (secondSlvl[indexTwo]?.[0] === secondCub[indexTwo]?.[0]) {
                secondCub[indexTwo] = secondSlvl[indexTwo + 1]
                  ? `${secondSlvl[indexOne]} ${secondSlvl[indexOne + 1]}`
                  : secondSlvl[indexOne];
              }
              cubCommand = `${firstCub.join(" ")} - ${secondCub.join(" ")}`;
            } else if (
              currentSlvlSportSpecies === "Хоккей" &&
              !inSlvlArr.realSport
            ) {
              // костыль для хоокея, т.к. там в скобках пишут хрень
              cubCommand = removeValuesInBrackets(cubCommand);
            } else if (currentSlvlSportSpecies === "Волейбол") {
              cubCommand = removeValuesInBrackets(cubCommand);
            }

            cubCommand = cutFunc(cubCommand).replace(/\(|\)/g, "");
            const result = Comparison.similarity(cubCommand, sportlvlCommand);

            const cubPlayers = cubCommand.split(" - ");
            // вот тут сравнение с базой
            cubPlayers[0] = dbParser(
              cubPlayers[0],
              DBcubPlayersFirst,
              sportlvlPlayers[0]
            );
            cubPlayers[1] = dbParser(
              cubPlayers[1],
              DBcubPlayersSecond,
              sportlvlPlayers[1]
            );
            //

            let secondStep = 0.95; // вернуть 0.95
            if (idealTime && result < secondStep) {
              const arrCubCo = cubPlayers.map((e) => e.split(" "));
              const arrSlvlCo = sportlvlPlayers.map((e) => e.split(" "));

              const c1 = arrCubCo[0];
              const c2 = arrCubCo[1];
              const s1 = arrSlvlCo[0];
              const s2 = arrSlvlCo[1];

              if (
                c1[0] &&
                c2[0] &&
                s1[0] &&
                s2[0] &&
                Comparison.similarity(c1[0], s1[0]) === 1 &&
                Comparison.similarity(c2[0], s2[0]) === 1
              )
                secondStep -= 0.15;
              if (
                c1[1] &&
                c2[1] &&
                s1[1] &&
                s2[1] &&
                Comparison.similarity(c1[1], s1[1]) >= 0.9 &&
                Comparison.similarity(c2[1], s2[1]) >= 0.9
              )
                secondStep -= 0.15;
            }

            const difsByTime = idealTime ? 0.7 : 0.8;

            if (result >= secondStep && idealTime) {
              allData.sportlvl[currentSlvlSportSpecies][
                currentSlvlIndexElem
              ].financeData = cubElement.financeData;

              if (cubElement.realSport) {
                allData.sportlvl[currentSlvlSportSpecies][
                  currentSlvlIndexElem
                ].realSport = cubElement.realSport;
              }

              allData.sportlvl[currentSlvlSportSpecies][
                currentSlvlIndexElem
              ].options = null;
              // обнуляем куб чтоб больше не участвовал в поиске
              allData.cub[currentSlvlSportSpecies][
                cubElementIndex
              ].players = `ЕСТЬ совпадение с - ${allData.sportlvl[currentSlvlSportSpecies][currentSlvlIndexElem].id}`;
              break;
            } else if (
              (result >= difsByTime ||
                (estimation(cubCommand, sportlvlCommand) && idealTime)) &
              !allData.sportlvl[currentSlvlSportSpecies][currentSlvlIndexElem]
                .financeData
            ) {
              const option = {
                optionsResult: `${cubElement.time.format("DD.MM.YYYY HH:mm")} ${
                  cubElement.players
                }`,
                data: cubElement,
                rate: result,
                fisrtPlayers:
                  Comparison.similarity(cubPlayers[0], sportlvlPlayers[0]) >=
                  0.9
                    ? null
                    : {
                        cubCommand: cubPlayers[0],
                        slvlCommand: sportlvlPlayers[0],
                      },
                secondPlayers:
                  Comparison.similarity(cubPlayers[1], sportlvlPlayers[1]) >=
                  0.9
                    ? null
                    : {
                        cubCommand: cubPlayers[1],
                        slvlCommand: sportlvlPlayers[1],
                      },
              };
              if (
                !allData.sportlvl[currentSlvlSportSpecies][currentSlvlIndexElem]
                  .options
              ) {
                allData.sportlvl[currentSlvlSportSpecies][
                  currentSlvlIndexElem
                ].options = [];
              }
              allData.sportlvl[currentSlvlSportSpecies][
                currentSlvlIndexElem
              ].options.push(option);

              if (cubElement.realSport) {
                allData.sportlvl[currentSlvlSportSpecies][
                  currentSlvlIndexElem
                ].realSport = cubElement.realSport;
              }
              continue;
            }
          }
        }
      }
    } catch (e) {
      console.log(e, "ERROR");
    }
    slvlKeys.push("FIFA");
    slvlKeys.push("NHL");
    slvlKeys.push("NBA 2K");
    slvlKeys.push("Баскетбол 3х3");
    slvlKeys.push("Шорт-хоккей");
    if (allData.sportlvl["Футбол"]) {
      allData.sportlvl["FIFA"] = allData.sportlvl["Футбол"].filter(
        (elem) => elem.realSport === "FIFA"
      );
      allData.sportlvl["Футбол"] = allData.sportlvl["Футбол"].filter(
        (elem) => elem.realSport !== "FIFA"
      );
    }
    if (allData.sportlvl["Хоккей"]) {
      allData.sportlvl["NHL"] = allData.sportlvl["Хоккей"].filter(
        (elem) => elem.realSport === "NHL"
      );
      allData.sportlvl["Шорт-хоккей"] = allData.sportlvl["Хоккей"].filter(
        (elem) => elem.realSport === "Шорт-хоккей"
      );
      allData.sportlvl["Хоккей"] = allData.sportlvl["Хоккей"].filter(
        (elem) => elem.realSport !== "NHL" && elem.realSport !== "Шорт-хоккей"
      );
    }
    if (allData.sportlvl["Баскетбол"]) {
      allData.sportlvl["NBA 2K"] = allData.sportlvl["Баскетбол"].filter(
        (elem) => elem.realSport === "NBA 2K"
      );
      allData.sportlvl["Баскетбол"] = allData.sportlvl["Баскетбол"].filter(
        (elem) => elem.realSport !== "NBA 2K"
      );

      allData.sportlvl["Баскетбол 3х3"] = allData.sportlvl["Баскетбол"].filter(
        (elem) => elem.realSport === "Баскетбол 3х3"
      );
      allData.sportlvl["Баскетбол"] = allData.sportlvl["Баскетбол"].filter(
        (elem) => elem.realSport !== "Баскетбол 3х3"
      );
    }

    allData.sportlvl.head = allData.sportlvl.head.concat(...allData.cub.head);
    console.log(allData);
    resolve(allData);

    // old -----------------------------------------------------

    //     for (let indexCub = 0; indexCub < data.cub.length; indexCub += 1) {
    //       // data.cub.forEach((element, indexCub) => {
    //       const element = data.cub[indexCub];
    //       try {
    //         if (element[0] === "Названия строк") {
    //           element.forEach((elem) => {
    //             if (elem !== "Названия строк" && elem !== null)
    //               data.sportlvl.head.push(elem);
    //           });
    //         } else if (data.unicSport.indexOf(element[0]) !== -1) {
    //           sportCash = element[0]; // если есть в выгрузке спортлелва - оперделяем вид спорта для дальнейших
    //         } else if (
    //           element[0] &&
    //           !(
    //             !element[0].split(" - ").length < 2 ||
    //             !element[0].split(" — ").length < 2
    //           ) &&
    //           element[0].indexOf(".202") === -1
    //         ) {
    //           // console.log(element[0]);
    //           // console.log(element[0].split(' - '), element[0].split(' — '), element[0].indexOf('.202') === -1)
    //           sportCash = null; // все остальные виды спорта - не смотрим
    //         } else if (sportCash) {
    //           let time = moment(element[0], "DD.MM.YYYY HH:mm:ss", true);
    //           const secondTime = moment(element[0], "DD.MM.YYYY H:mm:ss", true); // фикс для нолика у часа "15.06.2021 8:00:00", вместо такого "15.06.2021 08:00:00"
    //           const thirdTime = moment(element[0], "DD.MM.YYYY", true); // фикс для отсутствия времени - "15.06.2021" значит 24:00 ночи
    //           if (secondTime._isValid) time = secondTime;
    //           if (thirdTime._isValid) time = thirdTime;

    //           if (!time._isValid && !secondTime._isValid) {
    //             // если это не время - значит сохраняем имена игроков
    //             commandCash = element[0];
    //           } else {
    //             // а если время - начинаем сравнение элементов, при этом игроки у нас сохранены в commandCash для куба
    //             for (
    //               let elemSlvlIndex = 0;
    //               elemSlvlIndex < data.sportlvl[sportCash].length;
    //               elemSlvlIndex++
    //             ) {
    //               const elemSlvl = data.sportlvl[sportCash][elemSlvlIndex];
    //               if (elemSlvl[7]) continue;
    //               // не прямое совпадение времени!! Сразу в выборку.
    //               let wrong = false;
    //               // сначала проверяем что у команд совпало время
    //               if (elemSlvl[1] !== time.format()) {
    //                 wrong = !wrong;
    //                 // пилим проверку +\- 1 час от реального времени! [2], тут уже нет прямого совпадения
    //                 const plusHour = moment(elemSlvl[1]).add(1, "hour");
    //                 const subtractHour = moment(elemSlvl[1]).subtract(1, "hour");

    //                 if (!(time <= plusHour && time >= subtractHour)) continue;
    //               }
    //               let cubCommand = commandCash.toLowerCase();
    //               let sportlvlCommand = elemSlvl[3].toLowerCase();
    //               if (sportCash === "Настольный теннис") {
    //                 let indexOne, indexTwo;
    //                 let [firstSlvl, secondSlvl] = sportlvlCommand
    //                   .split("-")
    //                   .map((e) => parserTennis(e).elem);

    //                 let [firstCub, secondCub] = cubCommand
    //                   .split("-")
    //                   .map((e, i) => {
    //                     const { elem, index } = parserTennis(e);
    //                     if (i === 0) indexOne = index;
    //                     if (i === 1) indexTwo = index;
    //                     return elem;
    //                   });

    //                 // let slvlTennis = sportlvlCommand.replace(/ {2}/g, ' ').split(' ');
    //                 // const cubTennis = cubCommand.replace(/ {2}/g, ' ').split(' ')
    //                 // // если длинное имя, например Ву Дуй Тиеп - Ву Дуй Т.
    //                 // const firstCommandIndex = slvlTennis.indexOf('-') - 1;
    //                 // const secondCommandIndex = slvlTennis.length - 1;
    //                 // if (!firstSlvl[indexOne] || !firstCub[indexOne]) {
    //                 //   console.log('hello',firstSlvl, firstCub)
    //                 // }
    //                 if (
    //                   firstSlvl[indexOne]?.[0] === firstCub[indexOne]?.[0] ||
    //                   secondSlvl[indexTwo]?.[0] === secondCub[indexTwo]?.[0]
    //                 ) {
    //                   firstCub[indexOne] = firstSlvl[indexOne];
    //                   secondCub[indexTwo] = secondSlvl[indexTwo];
    //                   cubCommand = `${firstCub.join(" ")} - ${secondCub.join(" ")}`;
    //                 }
    //               }
    //               if (sportCash === "Волейбол") {
    //                 sportlvlCommand = sportlvlCommand.replace(/-про/g, " Про");
    //                 sportlvlCommand = sportlvlCommand.replace(/(до 19)/g, "(мол)");
    //                 sportlvlCommand = sportlvlCommand.replace(/(до 20)/g, "(мол)");
    //                 sportlvlCommand = sportlvlCommand.replace(/(до 21)/g, "(мол)");
    //               }
    //               if (sportCash === "Хоккей" && !elemSlvl.realSport) {
    //                 // костыль для хоокея, т.к. там в скобках пишут хрень
    //                 cubCommand = cubCommand
    //                   .split(" - ")
    //                   .map((elem) => {
    //                     return elem.replace(/\s\(.*\)/, "").trim();
    //                   })
    //                   .join(" - ");
    //                 sportlvlCommand = sportlvlCommand
    //                   .split(" - ")
    //                   .map((elem) => {
    //                     return elem.replace(/\s\(.*\)/, "").trim();
    //                   })
    //                   .join(" - ");
    //               }

    //               cubCommand = cutFunc(cubCommand).replace(/\(|\)/g, "");
    //               sportlvlCommand = cutFunc(sportlvlCommand).replace(/\(|\)/g, "");

    //               const result = Comparison.similarity(cubCommand, sportlvlCommand);
    //               let secondStep = 0.95;
    //               if (!wrong) {
    //                 const arrCubCo = cubCommand
    //                   .split(" - ")
    //                   .map((e) => e.split(" "));
    //                 const arrSlvlCo = sportlvlCommand
    //                   .split(" - ")
    //                   .map((e) => e.split(" "));

    //                 const c1 = arrCubCo[0];
    //                 const c2 = arrCubCo[1];
    //                 const s1 = arrSlvlCo[0];
    //                 const s2 = arrSlvlCo[1];
    //                 if (
    //                   c1[0] &&
    //                   c2[0] &&
    //                   s1[0] &&
    //                   s2[0] &&
    //                   Comparison.similarity(c1[0], s1[0]) === 1 &&
    //                   Comparison.similarity(c2[0], s2[0]) === 1
    //                 )
    //                   secondStep = 0.8;
    //                 if (
    //                   c1[1] &&
    //                   c2[1] &&
    //                   s1[1] &&
    //                   s2[1] &&
    //                   Comparison.similarity(c1[1], s1[1]) >= 0.9 &&
    //                   Comparison.similarity(c2[1], s2[1]) >= 0.9
    //                 )
    //                   secondStep = 0.7;
    //               }
    //               const difsByTime = !wrong ? 0.7 : 0.8;
    //               if (result >= secondStep && !wrong) {
    //                 let [, one, two, three, four] = element;
    //                 data.sportlvl[sportCash][elemSlvlIndex][4] = one;
    //                 data.sportlvl[sportCash][elemSlvlIndex][5] = two;
    //                 data.sportlvl[sportCash][elemSlvlIndex][6] = three;
    //                 data.sportlvl[sportCash][elemSlvlIndex][7] = four;
    //                 data.sportlvl[sportCash][elemSlvlIndex].realSport =
    //                   elemSlvl.realSport;
    //                 data.sportlvl[sportCash][elemSlvlIndex][8] = null;
    //                 break;
    //               } else if (
    //                 result >= difsByTime ||
    //                 (estimation(cubCommand, sportlvlCommand) && !wrong)
    //               ) {
    //                 const option = {
    //                   optionsResult: `${time.format(
    //                     "DD.MM.YYYY HH:mm"
    //                   )} ${commandCash}`,
    //                   data: element,
    //                   rate: result,
    //                 };
    //                 if (!data.sportlvl[sportCash][elemSlvlIndex][8]) {
    //                   data.sportlvl[sportCash][elemSlvlIndex][8] = [];
    //                 }
    //                 data.sportlvl[sportCash][elemSlvlIndex][8].push(option);

    //                 continue;
    //                 // console.log(data.sportlvl[sportCash][elemSlvlIndex].options)
    //               }
    //               // // настольный теннис
    //               // // if (commandCash === elemSlvl[3])
    //               // // записываем игроков из двух строк в кубе ("Абельмасов Игорь - Беляков Владимир") и спротлевела ("Абельмасов И. - Беляков В.")

    //               // let cubComandArr = commandCash.toLowerCase().split(' - '); //Куб, делим по тире, и кладем двух игроков в 2 елемента масива ["Абельмасов Игорь ", "Беляков Владимир"]
    //               // // prettier-ignore
    //               // let sportlvlComandArr = elemSlvl[3].toLowerCase().split(' - '); // Спотлевел делаем то же -  ["Абельмасов И. ", "Беляков В."]
    //               // if (sportCash === 'Хоккей') {
    //               //   // костыль для хоокея, т.к. там в скобках пишут хрень
    //               //   cubComandArr = cubComandArr.map((elem) => {
    //               //     return elem.replace(/\s\(.*\)/, '');
    //               //   });
    //               //   sportlvlComandArr = sportlvlComandArr.map((elem) => {
    //               //     return elem.replace(/\s\(.*\)/, '');
    //               //   });
    //               // }
    //               // const firstCubPlayer = cubComandArr[0].trim().split(' '); // нужно убрать пробелы в конце строки ("Абельмасов Игорь ") и приводим к массиву ['Абельмасов', 'Игорь']
    //               // // prettier-ignore
    //               // let firstSportlvlPlayer = sportlvlComandArr[0].trim().split(' '); // аналогично для Спорлевела
    //               // firstSportlvlPlayer = sportSpike(firstSportlvlPlayer, sportCash); // костыль для воляна, там может быть вот такая команда "Альянс-про - Пайп-про"
    //               // if (
    //               //   // сопадение первых пар - фамилия, имя
    //               //   firstCubPlayer.every((elemName, index) => {
    //               //     return comparison(
    //               //       elemName,
    //               //       firstSportlvlPlayer[index],
    //               //       sportCash,
    //               //       wrong,
    //               //     );
    //               //   })
    //               // ) {
    //               //   const secondCubPlayer = cubComandArr[1].trim().split(' '); // теперь аналогично достаём вторую пару
    //               //   // prettier-ignore
    //               //   let secondSportlvlPlayer = sportlvlComandArr[1].trim().split(' '); // аналогично для Спорлевела
    //               //   secondSportlvlPlayer = sportSpike(
    //               //     secondSportlvlPlayer,
    //               //     sportCash,
    //               //   );
    //               //   if (
    //               //     // и проверяем вторую пару игроков
    //               //     secondCubPlayer.every((elemName, index) => {
    //               //       return comparison(
    //               //         elemName,
    //               //         secondSportlvlPlayer[index],
    //               //         sportCash,
    //               //         wrong,
    //               //       );
    //               //     })
    //               //   ) {
    //               //     // и так, мы проверили время и игроков в обоих командах, пора пихать данные из куба в спорлевеловский масив
    //               //     data.sportlvl[sportCash][elemSlvlIndex] = elemSlvl.concat(
    //               //       element.slice(1, 5),
    //               //     );
    //               //     data.sportlvl[sportCash][elemSlvlIndex].realSport =
    //               //       elemSlvl.realSport;

    //               //     break;
    //               //   }
    //               // }
    //               // }
    //             }
    //           }
    //         }
    //       } catch (e) {
    //         console.log(e, "ERROR");
    //       }
    //     }
    //     // console.log('result', result); // настольник - 264
    //     let keys = Object.keys(data.sportlvl);

    //     const addZero = (num) => (parseFloat(num) < 10 ? "0" + num : num);
    //     for (let i = 0; i < keys.length; i++) {
    //       if (keys[i] !== "head") {
    //         data.sportlvl[keys[i]] = data.sportlvl[keys[i]].map((element) => {
    //           let newElem = element;
    //           const time = moment(newElem[2]);
    //           newElem[1] = `${addZero(time.date())}/${addZero(
    //             time.month() + 1
    //           )}/${time.year()}`;
    //           newElem[2] = `${addZero(time.hour())}:${addZero(time.minute())}`;
    //           return newElem;
    //         });
    //       }
    //     }
    //     keys.push("FIFA");
    //     keys.push("NHL");
    //     keys.push("NBA 2K");
    //     keys.push("Баскетбол 3х3");
    //     if (data.sportlvl["Футбол"]) {
    //       data.sportlvl["FIFA"] = data.sportlvl["Футбол"].filter(
    //         (elem) => elem.realSport === "FIFA"
    //       );
    //       data.sportlvl["Футбол"] = data.sportlvl["Футбол"].filter(
    //         (elem) => elem.realSport !== "FIFA"
    //       );
    //     }
    //     if (data.sportlvl["Хоккей"]) {
    //       data.sportlvl["NHL"] = data.sportlvl["Хоккей"].filter(
    //         (elem) => elem.realSport === "NHL"
    //       );
    //       data.sportlvl["Хоккей"] = data.sportlvl["Хоккей"].filter(
    //         (elem) => elem.realSport !== "NHL"
    //       );
    //     }
    //     if (data.sportlvl["Баскетбол"]) {
    //       data.sportlvl["NBA 2K"] = data.sportlvl["Баскетбол"].filter(
    //         (elem) => elem.realSport === "NBA 2K"
    //       );
    //       data.sportlvl["Баскетбол"] = data.sportlvl["Баскетбол"].filter(
    //         (elem) => elem.realSport !== "NBA 2K"
    //       );

    //       data.sportlvl["Баскетбол 3х3"] = data.sportlvl["Баскетбол"].filter(
    //         (elem) => elem.realSport === "Баскетбол 3х3"
    //       );
    //       data.sportlvl["Баскетбол"] = data.sportlvl["Баскетбол"].filter(
    //         (elem) => elem.realSport !== "Баскетбол 3х3"
    //       );
    //     }
    //     for (let i = 0; i < keys.length; i++) {
    //       if (
    //         keys[i] !== "head" &&
    //         data.sportlvl[keys[i]] &&
    //         data.sportlvl[keys[i]].length > 0
    //       ) {
    //         data.sportlvl[keys[i]].unshift(data.sportlvl.head);
    //       }
    //     }

    //     resolve(data);
  });
};

export default mainCalculations;
