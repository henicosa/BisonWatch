import * as d3 from "../../_snowpack/pkg/d3.js";
import { loadMoviesDataset } from "../movies.js";
import { loadKlimaDataset } from "../klima.js";
import { discretize } from "./discretize.js";
import { parallelsets } from "./parallelsets.js";
import { mosaicplot, sliceAndDice } from "./mosaicplot.js";
import { createHierarchy } from "./hierarchy.js";
import marked from "../../_snowpack/pkg/marked.js";
import whatwhyhow from "./whatwhyhow.js";
import { parallelcoordinates } from "./parallelcoordinates.js";

// This line includes the markdown file whatwhyhow.md 
// You will write your answer to Task 4 in it.
d3.select("div#whatwhyhow").html(marked(whatwhyhow));

// Load the movies dataset
loadMoviesDataset().then((movies) => {
  var klimadaten;
  loadKlimaDataset().then((klimad) => {
    //console.log(klimad)
    var stratify = d3.stratify()
                      .id(d => d["child"])
                      .parentId(d => d["parent"]);
    var root = stratify(klimad);
    //console.log(root);
    // apply the slice and dice algorithm
    // const rectangles = sliceAndDice({hierarchy:root});
    // plotting the rectangles as mosaic plot
    // mosaicplot({svg: d3.select("#mosaicplot"), rectangles: rectangles.length == 1? sampleRectangles : rectangles});
  });
  //console.log(movies);
  // visualize 4 quantitative attributes using the parallel 
  // coordinates
  parallelcoordinates({svg:d3.select("#parallelcoordinates"), 
  data:movies.slice(0, 1000), 
  attributes:[["releaseDate", d => d.releaseDate],
  ["performance", d => d.revenue - d.budget], 
  ["imdbRating", d => d.imdbRating],
  ["spokenLanguages", d => d.spokenLanguages.length]]});

  // Discretize some variables from the dataset, note
  // that setdata only contains the 4 discretized attributes
  const setdata = discretize(movies);

  // Select and order categorical attributes to visualize in 
  // the parallel sets and mosaic plots
  // You are welcome to play with these but note that both the
  // parallel sets as well as the mosaic plot suffer both from too
  // many attributes and from too high cardinality (so the number
  // of different attribute values)
  let attributeOrder = ["performance", "rating", "internationality", "period"];
  // from the attribute order, a hierarchy is created that 
  // splits the dataset into subsets of same attribute values
  const hierarchy = createHierarchy({data:setdata, attributeOrder: attributeOrder});
  //console.log(hierarchy); 
  // the data you get here is of the form
  // {
  //  children: [array of children, they have the same form]
  //  data: {name: attribute value (undefined for the root), nrItems: size of subset}
  //  depth: length of path to the root node
  //  height: length of path to deepest leaf node
  //  parent: parent node, it has the same form, null for root
  // }
  // 
  // plotting the output as parallel sets
  parallelsets({svg: d3.select("#parallelsets"), hierarchy});

  const sampleRectangles = [
    { path: ["one", "one"], height: 0.1, width: 0.1, x:0, y:0, nrItems: 1},
    { path: ["one", "two"], height: 0.4, width: 0.1, x:0, y:0.1, nrItems: 4},
    { path: ["one", "three"], height: 0.5, width: 0.1, x:0, y:0.5, nrItems: 5},
    { path: ["two", "one"], height: 0.33, width: 0.5, x:0.1, y:0, nrItems: 15},
    { path: ["two", "two"], height: 0.33, width: 0.5, x:0.1, y:0.33, nrItems: 15},
    { path: ["two", "three"], height: 0.34, width: 0.5, x:0.1, y:0.66, nrItems: 15},
    { path: ["three", "one"], height: 0.5, width: 0.4, x:0.6, y:0, nrItems: 15},
    { path: ["three", "two"], height: 0.4, width: 0.4, x:0.6, y:0.5, nrItems: 15},
    { path: ["three", "three"], height: 0.1, width: 0.4, x:0.6, y:0.9, nrItems: 15},
  ]
  // apply the slice and dice algorithm
  // const rectangles = sliceAndDice({hierarchy});
  // plotting the rectangles as mosaic plot
  // mosaicplot({svg: d3.select("#mosaicplot"), rectangles: rectangles.length == 1? sampleRectangles : rectangles});
});

// Load the movies dataset
loadKlimaDataset().then((klimad) => {
  //console.log(klimad)
  var stratify = d3.stratify()
                    .id(d => d["child"])
                    .parentId(d => d["parent"]);
  var rootd = stratify(klimad);

  //rootd.each(node => {if (isNaN(node.data.emission))  node.data.emission = 10})
  //console.log(root);
  // apply the slice and dice algorithm
  // const rectangles = sliceAndDice({hierarchy:root});
  // plotting the rectangles as mosaic plot
  // mosaicplot({svg: d3.select("#mosaicplot"), rectangles: rectangles.length == 1? sampleRectangles : rectangles});
//});

//d3.json("./03/flare-2.json").then(function(data) {

  var width = 932
  var height = width

  var pack = data => d3.pack()
  .size([width, height])
  .padding(3)
  (d3.hierarchy(data)
    .sum(d => d.data.emission)
    .sort((a, b) => b.data.emission - a.data.emission))

const root = pack(rootd);

console.log(root)

let focus = root;
let view;

var color = d3.scaleLinear()
    .domain([0, 6])
    .range(["hsl(52,80%,80%)", "hsl(28,30%,40%)"])
    .interpolate(d3.interpolateHcl)

const svg = d3.select("#climate_circles")
    .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
    .style("display", "block")
    .style("margin", "0 -14px")
    .style("background", color(0))
    .style("cursor", "pointer")
    .on("click", (event) => zoom(event, root));

const node = svg.append("g")
  .selectAll("circle")
  .data(root.descendants().slice(1))
  .join("circle")
    .attr("fill", d => d.children ? color(d.depth) : (d.data.data.compensation == "Yes" ? "#90EE90" : "white"))
    .attr("stroke",  null)
    .attr("pointer-events", d => !d.children ? "none" : null)
    .on("mouseover", function() {
      d3.select(this).attr("stroke", "#001");})
    .on("mouseout", function() { 
      d3.select(this).attr("stroke", null); })
    .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

const label = svg.append("g")
    .style("font", "10px sans-serif")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
  .selectAll("text")
  .data(root.descendants())
  .join("text")
    .style("fill-opacity", d => d.parent === root ? 1 : 0)
    .style("display", d => d.parent === root ? "inline" : "none")
    .style("display", d => d.parent === root ? "inline" : "none")
    .style("fill", "black")
    .style("font", d => d.height === 0 ? "italic" : "bold 15px sans-serif")
    .text(d => d.height === 0 ? !isNaN(d.data.data.emission) ? d.data.id + " " + "(" + d.data.data.emission + " tCO2e)" : null : d.data.id);

zoomTo([root.x, root.y, root.r * 2]);

function zoomTo(v) {
  const k = width / v[2];

  view = v;

  label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
  node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
  node.attr("r", d => d.r * k);
}

function zoom(event, d) {
  const focus0 = focus;

  focus = d;

  const transition = svg.transition()
      .duration(event.altKey ? 7500 : 750)
      .tween("zoom", d => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        return t => zoomTo(i(t));
      });

  label
    .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
    .transition(transition)
      .style("fill-opacity", d => d.parent === focus ? 1 : 0)
      .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
      .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
}



});



