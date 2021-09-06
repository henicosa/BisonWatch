import * as d3 from "d3";
import { loadBisonDataset } from "../bison";
import { loadTitanicDataset } from "../titanic"; 


// Importe für alte Visualisierungen
/*import { discretize } from "./vislibs/discretize";
import { parallelsets } from "./vislibs/parallelsets";
import { mosaicplot, sliceAndDice } from "./vislibs/mosaicplot";
import { createHierarchy } from "./vislibs/hierarchy";
import marked from "marked";
import whatwhyhow from "./whatwhyhow.md";
import { parallelcoordinates } from "./parallelcoordinates";*/

//
// Parallel Set Titanic
//
/*
// Load Titanic Dataset 
loadTitanicDataset().then((Titanicdata) => {
   console.log(Titanicdata);


    var width = 975
    var height = 720 
    //Warum geht das nicht? 
    var color = d3.scaleOrdinal(["Perished"], ["#da4f81"]).unknown("#ccc")
    var keys = data.columns.slice(0, -1) 
    var data = Titanicdata
    var d3 = require("d3@6", "d3-sankey@0.12")

    var sankey = d3.sankey()
          .nodeSort(null)
          .linkSort(null)
          .nodeWidth(4)
          .nodePadding(20)
          .extent([[0, 5], [width, height - 5]])

   
    const svg = d3.create("svg")
          .attr("viewBox", [0, 0, width, height]);
    
    const {nodes, links} = sankey({
          nodes: graph.nodes.map(d => Object.assign({}, d)),
          links: graph.links.map(d => Object.assign({}, d))
      });
    
      svg.append("g")
          .selectAll("rect")
          .data(nodes)
          .join("rect")
          .attr("x", d => d.x0)
          .attr("y", d => d.y0)
          .attr("height", d => d.y1 - d.y0)
          .attr("width", d => d.x1 - d.x0)
          .append("title")
          .text(d => `${d.name}\n${d.value.toLocaleString()}`);
    
      svg.append("g")
          .attr("fill", "none")
          .selectAll("g")
          .data(links)
          .join("path")
          .attr("d", d3.sankeyLinkHorizontal())
          .attr("stroke", d => color(d.names[0]))
          .attr("stroke-width", d => d.width)
          .style("mix-blend-mode", "multiply")
          .append("title")
          .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);
    
      svg.append("g")
          .style("font", "10px sans-serif")
          .selectAll("text")
          .data(nodes)
          .join("text")
          .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
          .attr("y", d => (d.y1 + d.y0) / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
          .text(d => d.name)
          .append("tspan")
          .attr("fill-opacity", 0.7)
          .text(d => ` ${d.value.toLocaleString()}`);
    
      return svg.node();

});

*/

// Laden der Bisondaten
loadBisonDataset().then((bisond) => {

  const sorter = {
    "Mo.": 1,
    "Di.": 2,
    "Mi.": 3,
    "Do.": 4,
    "Fr.": 5,
    "Sa.": 6,
    "missing": 7,
    "deutsch/englisch": 8
  };

  var type = ["Seminar","Vorlesung","Projektmodul","Integrierte Vorlesung","Sonstiges"];

  var attribute = "courseType"
  const get_att = {
    "sws": (d) => d.sws,
    "day": (d) => d.day,
    "courseType": (d) => d.courseType,
    "language": (d) => d.language
  }

  var data = d3.rollup(bisond, v => v.length, get_att[attribute])
  console.log(data);

  if (attribute == "courseType") {
    type = type.map((d) => {
      if (d != "Sonstiges") {
        console.log(d);
        return [d, data.get(d)];
      }
      else {
        return [d, d3.sum(data, (d) => type.includes(d[0]) ? 0 : d[1])]
      }
    
    })
    console.log(type)
    data = type 
  }

  type[3][0] = "Int. Vorlesung" 
  data =  Array.from(data)
  console.log(data);
  data = data.map((d) => {return {name: d[0].toString(), value: d[1]}})
  
  if (attribute == "day") {
      data = data.sort((a, b) => {return sorter[a.name] > sorter[b.name]
      })
  }   
  else {
  data = data.sort((a,b) => {return a.value < b.value})
  }

  // 
  // Simple bar chart
  // 
  var color = "lightblue"
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

  var svg = d3.select("#simple_barchart")
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



