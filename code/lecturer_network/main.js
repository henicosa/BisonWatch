import * as d3 from "d3";
//import { convertSkypackImportMapToLockfile } from "snowpack/lib/util";
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
  var blacklist = ["N.N", "N.N.", " N.N.", "missing", "keine öffentliche Person", " ", ""]
  var categories = ["Fakultät Architektur und Urbanistik", "Fakultät Bauingenieurwesen", "Fakultät Kunst und Gestaltung", "Fakultät Medien"]

  console.log(bisond)
  var lecturers = new Map();
  bisond.forEach(element => {
    element.lecturers.forEach(lecturer => {
      if (!blacklist.includes(lecturer.name) && lecturer.name != undefined) {
        if (!lecturers.has(lecturer.name)) lecturers.set(lecturer.name, {courses: new Set(), colecturers: new Map(), 
          faculty: categories.includes(lecturer.faculty) ? lecturer.faculty: "Sonstiges"})
          // update colectureres
          var colecturers = lecturers.get(lecturer.name).colecturers
          element.lecturers.forEach(lecturerB => {
            if ((lecturerB.name != lecturer.name) && (!blacklist.includes(lecturerB.name))) 
              if (colecturers.has(lecturerB.name))
                colecturers.set(lecturerB.name, colecturers.get(lecturerB.name) +1)
              else
                colecturers.set(lecturerB.name, 1)
          })
          // update course
          lecturers.get(lecturer.name).courses.add(element)
        }
      });
  });
  console.log(lecturers)
  const datalist = d3.select("#search")
  lecturers.forEach((d, lecturer) => {
    datalist.append("option")
      .attr("value", lecturer)
  })

  const attributeSelect = d3.select("#search_input")

  var lecturer_selected = false
  var force_selection = false
  var lecturer_selected_name = ""

  attributeSelect.on('input', function(e) {
    //if (e.key === 'Enter') {
      var input = d3.select("#search_input").property("value")
      if (lecturers.has(input)) {
        lecturer_selected_name = input;
        lecturer_selected = true
        force_selection = true
        select_teacher()
      } else {
        force_selection = false
      }
    //}
  });

  
    var height = 1000
    var width = 1000

    var colors = new Map().set("Fakultät Architektur und Urbanistik", "#009BB4")
                  .set("Fakultät Bauingenieurwesen", "#F39100")
                  .set("Fakultät Kunst und Gestaltung", "#94C11C")
                  .set("Fakultät Medien", "#006B94")
                  .set("Sonstiges", "grey")

    const scale = d3.scaleLinear()
      .domain([0, 16, 50])
      .range(["grey", "blue", "red"]);

    var mdata = {nodes: [], links: []};
    lecturers.forEach((value, lecturer_name) => {
      mdata.nodes.push({id: lecturer_name, group: value.courses.size, faculty: value.faculty})
      value.colecturers.forEach((lecture_num, colecturer_name) => {
        if (lecturer_name < colecturer_name) {
          mdata.links.push({source: lecturer_name,target: colecturer_name, value: lecture_num})
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

    function get_force(list, faculty) {
      var diam = 100
      var index = list.indexOf(faculty)
      if (index < list.length-2) {
        var bogen = 2*Math.PI/(list.length-1)
        return {x: diam*Math.cos(bogen*index), y: diam*Math.sin(bogen*index)}
      } else return {x: 0, y: 0}
    }

    categories.push("Sonstiges")
    var force_map = new Map()
    categories.forEach((d) => {force_map.set(d, get_force(categories, d))})

  
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("x", d3.forceX(d => force_map.get(d.faculty).x))
      .force("y", d3.forceY(d => force_map.get(d.faculty).y));
    
    const svg = d3.select("#lecturer_network")
        .attr("viewBox", [-width / 2, -height / 2, width, height])
    
    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed));

    var zoom = svg.append("g")
    
  
    function zoomed({transform}) {
      zoom.attr("transform", transform);
      zoom.transition()
    .duration(3750)
    }

    const link = zoom.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));
  
    const node = zoom.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", d => 5 + parseInt(Math.log(d.group)/ Math.log(1.5)))
        .attr("fill", d => lecturer_selected ? "LightGray" : colors.get(d.faculty))
        .call(drag(simulation))
        .on("mouseover", function(d) { if (!force_selection)
          d3.select(this).attr("r", d => 7 + parseInt(Math.log(d.group)/ Math.log(1.5))).style("fill",d => {
            lecturer_selected = true
            lecturer_selected_name = d.id
            redraw()
            return colors.get(d.faculty)
          });
        })                  
        .on("mouseout", function(d) { if (!force_selection)
          d3.select(this).attr("r", d => 5 + parseInt(Math.log(d.group)/ Math.log(1.5))).style("fill", d => {
            lecturer_selected = false
            redraw()
            return colors.get(lecturer_selected ? "LightGray" : colors.get(d.faculty))
          });
        });
  
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
  
    // function to redraw the graph on mouseover event
    function redraw() {
      zoom.selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", d => 5 + parseInt(Math.log(d.group)/ Math.log(1.5)))
        .attr("fill", d => (lecturer_selected && !is_connected(lecturer_selected_name, d.id)) ?  "LightGray" : colors.get(d.faculty))
        .call(drag(simulation))
    }

    function select_teacher() {
      zoom.selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", d => 5 + parseInt(Math.log(d.group)/ Math.log(1.5)))
        .attr("fill", d => (lecturer_selected && !is_connected(lecturer_selected_name, d.id)) ? lecturer_selected_name == d.id ? "red" : "LightGray" : colors.get(d.faculty))
        .call(drag(simulation))
    }

    //function to test if two nodes are connected:
    function is_connected(lecturer_A_name, lecturer_B_name) {
      return lecturers.get(lecturer_A_name).colecturers.has(lecturer_B_name)
    }

    //invalidation.then(() => simulation.stop());

  });


