<template>
  <button @click="copy">Сделать копирование</button>
</template>

<script>
/* eslint-disable */
import axios from 'axios';
import moment from 'moment';

export default {
  name: 'App',
  mounted: () => {
    // console.log('test');
  },
  methods: {
    copy() {
      axios.get(process.env.VUE_APP_URL + '/getResult').then((res) => {
        console.log(res, 'REEES');
        // // функция сравнения сравнивает Имена и возвращает Bool, например ("И.", 'Игорь') => true
        // const comparison = (first, second) => {
        //   if (
        //     first === second || // тут немного не просто
        //     first // сначала проверили что они в тупую равны друг другу "Игорь" == "Игорь"
        //       .split('') // теперь строку разбиваем на символы и смотрим по спортлевелу, т.к. там обычно короткое "И."
        //       .every(
        //         (e, index) => e === second[index] || e === '.', // и если точка и первая буква (и\или вторая тоже) совпала - то ок
        //       ) ||
        //     second // теперь в обратном порядке, если второй элемент сокращён до "И."
        //       .split('')
        //       .every((e, index) => e === first[index] || e === '.')
        //   ) {
        //     return true;
        //   }
        //   // дикий костыль для воляна, т.к. там могу забить не правильно - 'львы', 'лайонс'
        //   if (
        //     ['львы', 'лайонс'].indexOf(first) !== -1 &&
        //     ['львы', 'лайонс'].indexOf(second) !== -1
        //   ) {
        //     return true;
        //   } else if (
        //     // и такой же для хоккея =)
        //     ['нй', 'нью-йорк'].indexOf(first) !== -1 &&
        //     ['нй', 'нью-йорк'].indexOf(second) !== -1
        //   ) {
        //     return true;
        //   }
        //   return false;
        // };
        // const sportSpike = (arrToChange, sportType) => {
        //   if (arrToChange.length < 2 && sportType === 'Волейбол') {
        //     // разовый костыль для спортлевела в основном, но возможно ещё хоккей будет тут
        //     return arrToChange[0].split('-'); // т.к. строка вот такая 'альянс-про' например
        //   }
        //   return arrToChange;
        // };
        // // console.log(process.env);

        // const { data } = res;
        // // const testData = data.cub.slice(728, 730);
        // const testData = data.cub.slice(6686, 6688);
        // console.log(testData, 'testData');

        // let sportCash = null;
        // sportCash = 'Хоккей'; // для теста
        // let commandCash = null;
        // const sportsExclude = [
        //   'Counter-Strike',
        //   'MMA',
        //   'Баскетбол',
        //   'Бокс',
        //   'Водное поло',
        //   'Волейбол',
        //   'Настольный теннис',
        //   'Футбол',
        //   'Хоккей',
        // ];

        // testData.forEach((element) => {
        //   // try {
        //   // // console.log(moment(element[0], 'DD.MM.YYYY hh:mm:ss')._isValid, moment(element[0]).format());
        //   // if (!moment(element[0], 'DD.MM.YYYY hh:mm:ss')._isValid) {
        //   //   // console.log(count, element[0], sportCash);
        //   //   count += 1;
        //   //   if (count === 2) {
        //   //     // console.log('YEY', sportCash);
        //   //     sports.push(sportCash);
        //   //   } else {
        //   //     sportCash = element[0];
        //   //   }
        //   // } else {
        //   //   count = 0;
        //   //   sportCash = '';
        //   // }
        //   if (element[0] === 'Названия строк') {
        //     element.forEach((elem) => {
        //       if (elem !== 'Названия строк' && elem !== null)
        //         data.sportlvl.head.push(elem);
        //     });
        //   } else if (data.unicSport.indexOf(element[0]) !== -1) {
        //     sportCash = element[0]; // если есть в выгрузке спортлелва - оперделяем вид спорта для дальнейших
        //   } else if (sportsExclude.indexOf(element[0]) !== -1) {
        //     sportCash = null; // все остальные виды спорта - не смотрим
        //   } else if (sportCash) {
        //     let time = moment(element[0], 'DD.MM.YYYY HH:mm:ss', true);
        //     const secondTime = moment(element[0], 'DD.MM.YYYY H:mm:ss', true); // фикс для нолика у часа "15.06.2021 8:00:00", вместо такого "15.06.2021 08:00:00"
        //     const thirdTime = moment(element[0], 'DD.MM.YYYY', true); // фикс для отсутствия времени - "15.06.2021" значит 24:00 ночи
        //     if (secondTime._isValid) time = secondTime;
        //     if (thirdTime._isValid) time = thirdTime;

        //     if (!time._isValid && !secondTime._isValid) {
        //       // если это не время - значит сохраняем имена игроков
        //       commandCash = element[0];
        //     } else {
        //       // а если время - начинаем сравнение элементов, при этом игроки у нас сохранены в commandCash для куба
        //       for (
        //         let elemSlvlIndex = 0;
        //         elemSlvlIndex < data.sportlvl[sportCash].length;
        //         elemSlvlIndex++
        //       ) {
        //         const elemSlvl = data.sportlvl[sportCash][elemSlvlIndex];
        //         // сначала проверяем что у команд совпало время
        //         if (elemSlvl[1] === time.format()) {
        //           // настольный теннис
        //           if (commandCash === elemSlvl[3])
        //             console.log(elemSlvl[3], commandCash, 'ELEEEEEm');
        //           // записываем игроков из двух строк в кубе ("Абельмасов Игорь - Беляков Владимир") и спротлевела ("Абельмасов И. - Беляков В.")

        //           let cubComandArr = commandCash.toLowerCase().split(' - '); //Куб, делим по тире, и кладем двух игроков в 2 елемента масива ["Абельмасов Игорь ", "Беляков Владимир"]
        //           // prettier-ignore
        //           let sportlvlComandArr = elemSlvl[3].toLowerCase().split(' - '); // Спотлевел делаем то же -  ["Абельмасов И. ", "Беляков В."]
        //           if (sportCash === 'Хоккей') {
        //             // костыль для хоокея, т.к. там в скобках пишут хрень
        //             cubComandArr = cubComandArr.map((elem) => {
        //               return elem.replace(/\s\(.*\)/, '');
        //             });
        //             sportlvlComandArr = sportlvlComandArr.map((elem) => {
        //               return elem.replace(/\s\(.*\)/, '');
        //             });
        //           }
        //           const firstCubPlayer = cubComandArr[0].trim().split(' '); // нужно убрать пробелы в конце строки ("Абельмасов Игорь ") и приводим к массиву ['Абельмасов', 'Игорь']
        //           // prettier-ignore
        //           let firstSportlvlPlayer = sportlvlComandArr[0].trim().split(' '); // аналогично для Спорлевела

        //           firstSportlvlPlayer = sportSpike(
        //             firstSportlvlPlayer,
        //             sportCash,
        //           ); // костыль для воляна, там может быть вот такая команда "Альянс-про - Пайп-про"
        //           if (
        //             // сопадение первых пар - фамилия, имя
        //             firstCubPlayer.every((elemName, index) => {
        //               // console.log('ree', elemName, index, firstSportlvlPlayer);
        //               return comparison(elemName, firstSportlvlPlayer[index]);
        //             })
        //           ) {
        //             const secondCubPlayer = cubComandArr[1].trim().split(' '); // теперь аналогично достаём вторую пару
        //             // prettier-ignore
        //             let secondSportlvlPlayer = sportlvlComandArr[1].trim().split(' '); // аналогично для Спорлевела
        //             secondSportlvlPlayer = sportSpike(
        //               secondSportlvlPlayer,
        //               sportCash,
        //             );
        //             if (
        //               // и проверяем вторую пару игроков
        //               secondCubPlayer.every((elemName, index) => {
        //                 return comparison(
        //                   elemName,
        //                   secondSportlvlPlayer[index],
        //                 );
        //               })
        //             ) {
        //               // и так, мы проверили время и игроков в обоих командах, пора пихать данные из куба в спорлевеловский масив
        //               console.log('Всё совпало!');
        //               data.sportlvl[sportCash][elemSlvlIndex] = elemSlvl.concat(
        //                 element.slice(1, 5),
        //               );
        //               break;
        //             }
        //           }
        //         }
        //       }
        //     }
        //   }
        //   // } catch (e) {
        //   //   console.log(e, 'ERROR');
        //   // }
        // });
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
