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


// Laden der Bison-Daten
loadBisonDataset().then((bisond) => {
  var blacklist = ["N.N", "N.N.", " N.N.", "missing", "keine öffentliche Person"]
  console.log(bisond)
  var lecturers = new Map();
  bisond.forEach(element => {
    element.lecturers.forEach(lecturer => {
      if (!blacklist.includes(lecturer)) {
        if (!lecturers.has(lecturer)) lecturers.set(lecturer, {courses: new Set(), colecturers: new Map()})
          // update colectureres
          var colecturers = lecturers.get(lecturer).colecturers
          element.lecturers.forEach(lecturerB => {
            if ((lecturerB != lecturer) && (!blacklist.includes(lecturerB))) 
              if (colecturers.has(lecturerB))
                colecturers.set(lecturerB, colecturers.get(lecturerB) +1)
              else
                colecturers.set(lecturerB, 1)
          })
          // update course
          lecturers.get(lecturer).courses.add(element)
        }
      });
  });
  console.log(lecturers)

  
    var height = 800
    var width = 1000


    const scale = d3.scaleLinear()
      .domain([-0, 16, 50])
      .range(["grey", "blue", "red"]);
    var color =  d => scale(d.group);

    var mdata = {nodes: [], links: []};
    lecturers.forEach((value, lecturer) => {
      mdata.nodes.push({id: lecturer, group: value.courses.size})
      value.colecturers.forEach((lecture_num, colecturer) => {
        if (lecturer < colecturer) {
          mdata.links.push({source: lecturer,target: colecturer, value: lecture_num})
        }
      })
    })
    console.log(mdata)
    // Interaction
    var data = mdata

    var drag = simulation => {

      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    }

    // SVG

    const links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));
  
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX())
      .force("y", d3.forceY());
    
    const svg = d3.select("#lecturer_network")
        .attr("viewBox", [-width / 2, -height / 2, width, height]);
  
    const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));
  
    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", d => 5 + parseInt(Math.log(d.group)/ Math.log(1.5)))
        .attr("fill", color)
        .call(drag(simulation));
  
    node.append("title")
        .text(d => d.id);
  
    simulation.on("tick", () => {
      link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
  
      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    });
  
    //invalidation.then(() => simulation.stop());

  });


