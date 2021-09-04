import * as d3 from "d3";
import { loadBisonDataset } from "../bison";


// Importe für alte Visualisierungen
/*import { discretize } from "./vislibs/discretize";
import { parallelsets } from "./vislibs/parallelsets";
import { mosaicplot, sliceAndDice } from "./vislibs/mosaicplot";
import { createHierarchy } from "./vislibs/hierarchy";
import marked from "marked";
import whatwhyhow from "./whatwhyhow.md";
import { parallelcoordinates } from "./parallelcoordinates";*/


// Laden der Klimadaten
loadBisonDataset().then((bisond) => {
  console.log(bisond)
  console.log(d3.group(bisond, d => d.language))

  //Sophie hier:
  var data = d3.rollup(bisond, v => v.length, d => d.courseType)
  //console.log(data);
  
  data =  Array.from(data)
  console.log(data);
  data = data.map((d) => {return {name: d[0], value: d[1]}})
  data = data.sort((a,b) => {return a.value < b.value})

  
      
  
  var color = "steelblue"
  var height = 500
  var margin = ({top: 30, right: 0, bottom: 150, left: 40})
  var width = 932

  var x = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)]).nice()
    .range([height - margin.bottom, margin.top])

  var xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(i => (data[i].name.length <=15) ? data[i].name:data[i].name.slice(0, 12) + "...").tickSizeOuter(0))
    .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)" );

  var yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, data.format))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(data.y))

  const svg = d3.select("#alphabet")
                .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
    .attr("fill", color)
    .selectAll("rect")
    .data(data)
    .join("rect")
      .attr("x", (d, i) => x(i))
      .attr("y", d => y(d.value))
      .attr("height", d => y(0) - y(d.value))
      .attr("width", x.bandwidth());

  svg.append("g")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

});



