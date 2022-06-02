import XlsxPopulate from 'xlsx-populate';

const writeToFile = (data) => {
  // записываем данные в новый лист
  XlsxPopulate.fromBlankAsync().then((workbook) => {
    data.forEach((e) => {
      if (e[1]) {
        const sheetName =
          e[1][0] === e[e.length - 1][0]
            ? e[1][0]
            : `${e[1][0]} - ${e[e.length - 1][0]}`;
        let listRange = workbook.addSheet(sheetName).range(`A1:J${e.length}`);
        listRange.value(e);
      }
    });
    workbook.deleteSheet('Sheet1');
    return workbook.toFileAsync('./tech_problem/out.xlsx');
  });
};

export default writeToFile;
