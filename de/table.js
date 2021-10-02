import * as d3 from "d3";

// Params:
// node: the table element
// columns: an array of objects, one for each column
//  - title: the title for the column
//  - content: a function with the item as argument that returns the html content
//  - align (optional): the text-align property, defaults to "left"
export function table({ node, columns = null, data } = {}) {
  // setup default columns if none were given
  if (!columns) {
    columns = Object.entries(data[0]).map(([key, _]) => ({
      title: key,
      content: (item) => item[key],
    }));
  }

  // header
  node
    .append("thead")
    .append("tr")
    .selectAll("th")
    .data(columns)
    .join("th")
    .style("text-align", (col) => ("align" in col ? col.align : "left"))
    .text((col) => col.title);

  // create a row per item
  const rows = node
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .enter()
    .append("tr");

  // create a cell for each column
  const cells = rows
    .selectAll("td")
    .data((item) => d3.cross(columns, [item]))
    .join("td")
    .style("text-align", ([col, _]) => ("align" in col ? col.align : "left"))
    .html(([col, item]) => col.content(item));
}
