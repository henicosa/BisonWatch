import * as d3 from "d3";
import { sankey as Sankey, sankeyLinkHorizontal as SLH } from 'd3-sankey';
import { loadTitanicDataset } from "../titanic"; 
import { loadBisonDataset } from "../bison";

// Importe für alte Visualisierungen
/*import { discretize } from "./vislibs/discretize";
import { parallelsets } from "./vislibs/parallelsets";
import { mosaicplot, sliceAndDice } from "./vislibs/mosaicplot";
import { createHierarchy } from "./vislibs/hierarchy"; */
import marked from "marked";
import result from "./result.md";



//
// Parallel Set Bison Daten
// 
// Load Bison Data 
loadBisonDataset().then((bisond) => {

  d3.select("div#result").html(marked(result));

  console.log(bisond);

  bisond.map((d) => {
    if (d.sws < 3) d.sws = "0-3"
    else if (d.sws < 6) d.sws = "4-6"
    else if (d.sws < 12) d.sws = "8-12"
    else if (d.sws <= 18) d.sws = "16-18"
    else d.sws = "Keine Angabe"
    return d    
  })


  var width = 975
  var height = 720 
  
  var colors = new Map().set("Fakultät Architektur und Urbanistik", "#009BB4")
                  .set("Fakultät Bauingenieurwesen", "#F39100")
                  .set("Fakultät Kunst und Gestaltung", "#94C11C")
                  .set("Fakultät Medien", "#006B94")
                  .set("Sonstiges", "grey")

  function color (faculty) {
    var color = colors.get(faculty)
    
    if (color == undefined){
      return "grey"
    }
    return colors.get(faculty)
  }
  
   
  var data = bisond
  var keys = ["faculty", "day", "sws", "language"]
  var svg = d3.select("#parallel_set").attr("width", width).attr("height", height); 


  var sankey = Sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(8)
        .nodePadding(20)
        .extent([[0, 5], [width, height - 5]])

  let index = -1;
  var nodes = [];
  const nodeByKey = new Map;
  const indexByKey = new Map;
  var links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = JSON.stringify([k, d[k]]);
      if (nodeByKey.has(key)) continue;
      const node = {name: d[k]};
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new Map;
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) { link.value += value; continue; }
      link = {
        source: indexByKey.get(JSON.stringify([a, d[a]])),
        target: indexByKey.get(JSON.stringify([b, d[b]])),
        names,
        value
      };
      links.push(link);
      linkByKey.set(key, link);
    }
  }

  var graph = {nodes, links};

  var {nodes, links} = sankey({
    nodes: graph.nodes.map(d => Object.assign({}, d)),
    links: graph.links.map(d => Object.assign({}, d))
  });

  
  svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("fill", "LightGrey")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      // click function to fill bars
      .on("click", function(d) { 
        if (d3.select(this).attr("fill") == "red") {
          d3.select(this).attr("fill", "LightGrey")
        } else d3.select(this).attr("fill", "red")
      })
      .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .attr("fill", "none")
      .selectAll("g")
      .data(links)
      .join("path")
      .attr("d", SLH())
      .attr("stroke", d => color(d.names[0]))
      .attr("stroke-width", d => d.width)
      .style("mix-blend-mode", "multiply")
      .append("title")
      .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

  // function to redraw graph when clicking on bars 
  //function redraw() {
  //  svg.append("g").selectAll("path")
  //  .data(links)
  //  .join("path")
  //  .attr("fill", )
  //}

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


      

});

/*
//
// Parallel Set Titanic
// https://observablehq.com/@d3/parallel-sets

// Load Titanic Dataset 
loadTitanicDataset().then((Titanicdata) => {
   //console.log(Titanicdata);

    var width = 975
    var height = 720 
    var color = d3.scaleOrdinal(["Perished"], ["#da4f81"]).unknown("#ccc")
    var data = Titanicdata
    var keys = data.columns.slice(0, -1) 
    
    
    //const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);
    //const svg = d3.select("parallel_set").attr("viewBox", [-width / 2, -height / 2, width, height])

    var svg = d3.select("#simple_barchart").attr("width", width).attr("height", height);

    //Deswegen ging das nicht...
    //var d3 = require("d3@6", "d3-sankey@0.12")

    var sankey = Sankey()
          .nodeSort(null)
          .linkSort(null)
          .nodeWidth(4)
          .nodePadding(20)
          .extent([[0, 5], [width, height - 5]])

          let index = -1;
          var nodes = [];
          const nodeByKey = new Map;
          const indexByKey = new Map;
          var links = [];
        
          for (const k of keys) {
            for (const d of data) {
              const key = JSON.stringify([k, d[k]]);
              if (nodeByKey.has(key)) continue;
              const node = {name: d[k]};
              nodes.push(node);
              nodeByKey.set(key, node);
              indexByKey.set(key, ++index);
              //console.log(d)
            }
          }
        
          for (let i = 1; i < keys.length; ++i) {
            const a = keys[i - 1];
            const b = keys[i];
            const prefix = keys.slice(0, i + 1);
            const linkByKey = new Map;
            for (const d of data) {
              const names = prefix.map(k => d[k]);
              const key = JSON.stringify(names);
              const value = d.value || 1;
              let link = linkByKey.get(key);
              if (link) { link.value += value; continue; }
              link = {
                source: indexByKey.get(JSON.stringify([a, d[a]])),
                target: indexByKey.get(JSON.stringify([b, d[b]])),
                names,
                value
              };
              links.push(link);
              linkByKey.set(key, link);
            }
          }
        
          var graph = {nodes, links};
          //console.log(graph)

    
    var {nodes, links} = sankey({
          nodes: graph.nodes.map(d => Object.assign({}, d)),
          links: graph.links.map(d => Object.assign({}, d))
      });
      
      //console.log(nodes)

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
          .attr("d", SLH())
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
    
});
*/

//
/*
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

*/

