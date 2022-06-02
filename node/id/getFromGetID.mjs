import XlsxPopulate from "xlsx-populate";
import moment from "moment";

const descriptor = ({ month }, sheet) => {
	const final = [];
	sheet.forEach((elem) => {
		try {
			const arr = elem[0].split(" - ");
			if (arr.length === 4) {
				if (moment(new Date(arr[2])).month() + 1 == parseFloat(month)) {
					const str = arr[3].split("Match-ID: ")[1].split(")")[0];
					final.push([str]);
				}
				// if (moment.utc(arr[2]).month + 1 === month) {

				// }
			}
		} finally {
            // always runs
        }
	});
	return final;
};

const getFromCub = (month) => {
	return new Promise((resolve) => {
		const fileName = "Retirement and walkover.xlsx";
		XlsxPopulate.fromFileAsync(`./id/${fileName}`).then((workbook) => {
			const sheet = workbook.sheet(0).usedRange().value();

			const result = descriptor(month, sheet);

			// записываем данные в новый лист
			XlsxPopulate.fromBlankAsync().then((newWorkbook) => {
				let listRange = newWorkbook
					.addSheet(fileName)
					.range(`A1:A${result.length}`);
				listRange.value(result);

				newWorkbook.deleteSheet("Sheet1");
				return newWorkbook.toFileAsync(`./id/out-${fileName}`);
			});

			resolve(result);
		});
	});
};

export default getFromCub;
