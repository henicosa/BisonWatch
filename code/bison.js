import { dsv, isoParse } from "d3";

export async function loadBisonDataset() {
  return await dsv("\t", "/data/bisondata20201.csv", (item) => ({
    courseTitle: item.Veranstaltungstitel,
    internalLink: item.Bisonlink,
    courseType: item.Veranstaltungsart,
    sws: + item.SWS, // transform string to number
    language: item.Sprache, 
    day: item.Tag,
    faculty: item.Fakultät,
    lecturers: item.Personen.split(" :3 S: ").map((d) => {return {faculty: d.split(",")[0], name: d.split(",")[1]}})
  }));
}
