const sportSpike = (arrToChange, sportType) => {
  if (arrToChange.length < 2 && sportType === 'Волейбол') {
    // разовый костыль для спортлевела в основном, но возможно ещё хоккей будет тут
    return arrToChange[0].split('-'); // т.к. строка вот такая 'альянс-про' например
  }
  return arrToChange;
};

export default sportSpike;
