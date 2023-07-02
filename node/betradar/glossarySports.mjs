const glossarySports = {
  "Австралийский футбол": "Aussie rules",
  "Американский футбол": "Football",
  Бадминтон: "Badminton",
  Баскетбол: "Basketball",
  Бейсбол: "Baseball",
  Гандбол: "Handball",
  Дартс: "Darts",
  "Настольный теннис": "Table tennis",
  "Пляжный волейбол": "Beach Volley",
  Регби: "Rugby",
  Теннис: "Tennis",
  Футбол: "Soccer",
  Футзал: "Futsal",
  Хоккей: "Ice Hockey",
};
const keys = Object.keys(glossarySports);
glossarySports.getEngNamesByArr = () => keys.map((e) => glossarySports[e]);

export default glossarySports;
