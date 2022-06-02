const comparisonWithError = (first, second, errorCount = 2) => {
  let errorCounter = errorCount;
  let firstArr = first.split('');
  let secondArr = second.split('');
  if (firstArr.length < secondArr.length) {
    const cahnge = firstArr;
    firstArr = secondArr;
    secondArr = cahnge;
  }
  let i = 0;
  for (; i < firstArr.length; i += 1) {
    if (firstArr[i] !== secondArr[i]) {
      errorCounter -= 1;
      if (firstArr[i + 1] === secondArr[i]) {
        firstArr.splice(i, 1);
      }
      if (errorCounter < 0) {
        return false;
      }
    }
  }
  return true;
};

// функция сравнения сравнивает Имена и возвращает Bool, например ("И.", 'Игорь') => true
const comparison = (first, second, realSport) => {
  if (
    first === second || // тут немного не просто
    first // сначала проверили что они в тупую равны друг другу "Игорь" == "Игорь"
      .split('') // теперь строку разбиваем на символы и смотрим по спортлевелу, т.к. там обычно короткое "И."
      .every(
        (e, index) => e === second[index] || e === '.', // и если точка и первая буква (и\или вторая тоже) совпала - то ок
      ) ||
    second // теперь в обратном порядке, если второй элемент сокращён до "И."
      .split('')
      .every((e, index) => e === first[index] || e === '.')
  ) {
    return true;
  }
  // дикий костыль для воляна, т.к. там могу забить не правильно - 'львы', 'лайонс'
  if (
    // и такой же для хоккея =)
    ['львы', 'лайонс'].indexOf(first) !== -1 &&
    ['львы', 'лайонс'].indexOf(second) !== -1
  ) {
    return true;
  } else if (
    ['нй', 'нью-йорк'].indexOf(first) !== -1 &&
    ['нй', 'нью-йорк'].indexOf(second) !== -1
  ) {
    return true;
  } else if (
    ['пингвинс', 'пингвинз'].indexOf(first) !== -1 &&
    ['пингвинс', 'пингвинз'].indexOf(second) !== -1
  ) {
    return true;
  } else if (
    ['койотис', 'койотс'].indexOf(first) !== -1 &&
    ['койотис', 'койотс'].indexOf(second) !== -1
  ) {
    return true;
  }

  // новый костыль для фифы, погрешность в 1 символ
  if (realSport === 'FIFA') {
    return comparisonWithError(first, second);
  }
  return false;
};

export default comparison;
