import { csv, isoParse } from "../_snowpack/pkg/d3.js";

export async function loadKlimaDataset() {
  return await csv("/data/klima.csv", (item) => ({
    child: item.child,
    parent: item.parent,
    emission: +item.emission, // transform string to number
    name: item.name,
    originalData: +item.originalData, // transform string to number
    originalUnit: item.originalUnit,
    compensation: item.compensation,
    year: +item.year,
    remarks: item.remarks,
    source: item.source,
  }));
}
