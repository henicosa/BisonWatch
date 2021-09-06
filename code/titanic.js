import { csv, isoParse } from "d3";

export async function loadTitanicDataset() {
  return await csv("/data/titanic.csv", (item) => ({
    survived: item.Survived,
    sex: item.Sex,
    age: item.Age, 
    class: item.Class, 
    value: +item.Value
  }));
}
