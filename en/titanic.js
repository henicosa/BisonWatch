import { csv, isoParse } from "d3";

export async function loadTitanicDataset() {
  return await csv("/data/titanic.csv", (item) => ({
    Survived: item.Survived,
    Sex: item.Sex,
    Age: item.Age, 
    Class: item.Class, 
    value: +item.value
  }));
}
