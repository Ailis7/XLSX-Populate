import XlsxPopulate from 'xlsx-populate';

const cubDataAsync = (data) => {
  console.log(data)
  return new Promise((resolve) => {
    XlsxPopulate.fromDataAsync(data).then((workbook) => {
      const sheetCub = workbook // достаём значения из выгрузки Куба
        .sheet(0)
        .usedRange()
        .value();
      // console.log('sheetCub', sheetCub)
      resolve(sheetCub);
    });
  });
};

export default cubDataAsync;
