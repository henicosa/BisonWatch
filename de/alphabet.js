import { csv, isoParse } from "d3";

export async function loadAlphabetDataset() {
  return await csv("/data/alphabet.csv", (item) => ({
    letter: item.letter,
    frequency: +item.frequency
  }));
}
