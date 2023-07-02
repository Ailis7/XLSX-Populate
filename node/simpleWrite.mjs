import XlsxPopulate from "xlsx-populate";

const simpleWrite = ({dataToWrite, sportCounterToWrite}) => {
  // записываем данные в новый лист
  XlsxPopulate.fromBlankAsync().then((workbook) => {
    const sheet0 = workbook.sheet(0);
    let listRange = sheet0.range(`A1:K${dataToWrite.length}`);
    sheet0.range(`K2:K${dataToWrite.length}`).style({ wrapText: true });
    sheet0.range(`C2:C${dataToWrite.length}`).style({ numberFormat: "dd.mm.yyyy" });
    sheet0.range(`D2:D${dataToWrite.length}`).style({ numberFormat: "hh:mm" });
    listRange.value(dataToWrite);

    let listRange2 = workbook.addSheet('Sheet2').range(`A1:B${sportCounterToWrite.length}`);
    listRange2.value(sportCounterToWrite);

    return workbook.toFileAsync("./EXCEL/out-betradar.xlsx");
  });
};

export default simpleWrite;
