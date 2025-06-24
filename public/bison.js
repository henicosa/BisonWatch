import { dsv, isoParse } from "d3";
import global_settings from './general_settings.json';

export async function loadBisonDataset(dataset) {
  console.log("Loading dataset for " + dataset)
  return await dsv("\t", dataset, (item) => ({
    courseTitle: item.Veranstaltungstitel,
    internalLink: item.Bisonlink,
    courseType: item.Veranstaltungsart,
    sws: + item.SWS, // transform string to number
    language: item.Sprache, 
    day: item.Tag,
    faculty: renameFaculty(item.Fakultät),
    lecturers: item.Personen.split(" :3 S: ").map((d) => {return {faculty: renameFaculty(d.split(",")[0].replace("Fakultät ", "")), name: d.split(",")[1]}})
  }));
}

function renameFaculty(faculty) {
  if (faculty === "Bauingenieurwesen" || faculty === "Bau- und Umweltingenieurwissenschaften") {
    return "BU"
  }
  if (faculty === "Architektur und Urbanistik") {
    return "AU"
  }
  if (faculty === "Kunst und Gestaltung") {
    return "KG"
  }
  if (faculty === "Medien") {
    return "M"
  }
  return faculty
}


// Parse JSON data into a JavaScript object
export {global_settings}
