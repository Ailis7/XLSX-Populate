import moment from "moment";

const momentTime = (date, time) => {
  const newDate = date.split("/").reverse();
  newDate[1] = parseFloat(newDate[1]) - 1; // добавляем месяц
  return moment(
    // переобразуем и кладём с минутами
    newDate.concat(time.split(":"))
  );
};

export default momentTime;
