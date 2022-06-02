import XlsxPopulate from 'xlsx-populate';

const getFromCub = () => {
  return new Promise((resolve) => {
    XlsxPopulate.fromFileAsync('./EXCEL/Куб спортлевел май 2022 до 30.05.xlsx').then((workbook) => {
      const sheetSLvl = workbook // достаём значения из выгрузки Куба
        .sheet(0)
        .usedRange()
        .value();

      resolve(sheetSLvl);
    });
  });
};

export default getFromCub;
