import glossary from "./glossary.mjs";

const splitAndSearch = (str) => {
  const commandArr = str.split(" (");
  commandArr[0] = glossary[commandArr[0]] || commandArr[0];
  return commandArr.join(" (");
};

export default function translater(notTranslatedCommands) {
  try {
    const result = notTranslatedCommands.split(" - ");
    result[0] = splitAndSearch(result[0]);
    result[1] = splitAndSearch(result[1]);
    return result.join(" - ");
  } catch (e) {
    return notTranslatedCommands;
  }
}
