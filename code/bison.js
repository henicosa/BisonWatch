import { dsv, isoParse } from "d3";

export async function loadBisonDataset() {
  return await dsv("\t", "/data/bisondata.csv", (item) => ({
    courseTitle: item.Veranstaltungstitel,
    internalLink: item.Bisonlink,
    courseType: item.Veranstaltungsart,
    sws: +item.sws, // transform string to number
    language: item.Sprache, 
    day: item.Tag,
  }));
}
