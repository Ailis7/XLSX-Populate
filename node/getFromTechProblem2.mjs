import XlsxPopulate from "xlsx-populate";
import moment from "moment";
moment.locale("ru");

const result = {};
const parseFunc = (array, x) => {
	let hour, day;
	for (let i = 1; i < array.length; i++) {
		const [time, count] = array[i];
		const date = moment(ExcelDateToJSDate(time));
		if (hour === undefined) hour = date.hour();
		// day < date.date()
		if (!day || day !== date.format("dddd")) {
			hour = date.hour();
			// day = date.date()
			day = date.format("dddd");
			if (!result[day]) {
                result[day] = { [hour]: [0, 0] };
				// result[day] = { [hour]: [date.format("DD-MM-YYYY"), 0, 0] };
			}
		}

		if (hour < date.hour()) {
			hour = date.hour();
			if (!result[day][hour]) {
                result[day][hour] = [0, 0];
				// result[day][hour] = [date.format("DD-MM-YYYY"), 0, 0];
			}
		}
		result[day][hour][x] += count;
	}
	return result;
};
const descriptor = (eventsArr, betsArr) => {
	// const finalArr = [[["Дата", "Время", "Кол-во событий", "Кол-во ставок"]]];

	parseFunc(eventsArr, 0);
	parseFunc(betsArr, 1);
    return result
};

const getFromTechProblem2 = () => {
	return new Promise((resolve) => {
		XlsxPopulate.fromFileAsync(
			"./tech_problem/кол-во соьытий на момент времени.xlsx"
		).then((workbook) => {
			const events = workbook.sheet(0).usedRange().value();
			const bets = workbook.sheet(1).usedRange().value();

			const final = descriptor(events, bets);

            const keys = Object.keys(final); 


            XlsxPopulate.fromBlankAsync().then((workbook) => {
                for (let i = 0; i < keys.length; i += 1) {
                    const sheetName = keys[i];
                    const writeArr = [["Время", "Кол-во событий", "Кол-во ставок"]];
                    for (let y = 0; y < 24; y += 1) {
                        const arr = result[sheetName][y]
                        writeArr.push([y, arr[0], arr[1]])
                    }
                    let listRange = workbook.addSheet(sheetName).range(`A1:D${writeArr.length}`);
                    listRange.value(writeArr)
                }
                
                workbook.deleteSheet('Sheet1');
                return workbook.toFileAsync('./tech_problem/out.xlsx');
            });

			resolve(result);
		});
	});
};

export default getFromTechProblem2;

function ExcelDateToJSDate(serial) {
	var utc_days = Math.floor(serial - 25569);
	var utc_value = utc_days * 86400;
	var date_info = new Date(utc_value * 1000);

	var fractional_day = serial - Math.floor(serial) + 0.0000001;

	var total_seconds = Math.floor(86400 * fractional_day);

	var seconds = total_seconds % 60;

	total_seconds -= seconds;

	var hours = Math.floor(total_seconds / (60 * 60));
	var minutes = Math.floor(total_seconds / 60) % 60;

	return new Date(
		date_info.getFullYear(),
		date_info.getMonth(),
		date_info.getDate(),
		hours,
		minutes,
		seconds
	);
}
