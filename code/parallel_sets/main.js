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
      if (d != "Sonstiges")
        return [d, data.get(d)];
      else {
        return [d, d3.sum(data, (d) => type.includes(d[0]) ? 0 : d[1])]
      }
    })
    console.log(type)
    data = type 
  }

  
  data =  Array.from(data)
  console.log(data);
  data = data.map((d) => {return {name: d[0].toString(), value: d[1]}})
  
  if (attribute == "day") {
      data = data.sort((a, b) => {return sorter[a.name] > sorter[b.name]
      })
  }   
  
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



