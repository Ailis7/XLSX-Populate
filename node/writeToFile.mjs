import XlsxPopulate from 'xlsx-populate';

const writeToFile = (data) => {
  // записываем данные в новый лист
  XlsxPopulate.fromBlankAsync().then((workbook) => {
    const keys = Object.keys(data.sportlvl);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== 'head') {
        // если ключ не шапка..
        const arr = data.sportlvl[keys[i]]; // текущий масив
        // криво немного, всегда должен быть лист с именем 'Sheet1', поэтому вот так
        let listRange = workbook
          .addSheet(keys[i])
          .range(`A1:J${arr.length + 1}`);
        listRange.value(arr);
      }
    }
    workbook.deleteSheet('Sheet1'); // лист с таким именем всё равно создаётся, тут криво немного работает в самой библе!!
    return workbook.toFileAsync('./EXCEL/out.xlsx');
  });
};

export default writeToFile;
