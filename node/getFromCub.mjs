import XlsxPopulate from 'xlsx-populate';

const getFromCub = () => {
  return new Promise((resolve) => {
    XlsxPopulate.fromFileAsync('./EXCEL/спортлевел 31.08.xlsx').then((workbook) => {
      const sheetSLvl = workbook // достаём значения из выгрузки Спортлевела
        .sheet(0)
        .usedRange()
        .value();

      resolve(sheetSLvl);
    });
  });
};

export default getFromCub;
