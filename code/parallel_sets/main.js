import * as d3 from "d3";
import { sankey as Sankey, sankeyLinkHorizontal as SLH } from 'd3-sankey';
import { loadTitanicDataset } from "../titanic"; 
import { loadBisonDataset } from "../bison";
import d3_colorLegend from "https://api.observablehq.com/@d3/color-legend.js?v=3"



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
loadBisonDataset("/data/bisondata20212.csv").then((bisond) => {



  //d3.select("div#result").html(marked(result));

  //console.log(bisond);

  var keys = ["faculty",  "language", "day", "sws",]

    // Map to get official color from faculty name
  var colors = new Map().set("Fakultät Architektur und Urbanistik", "#009BB4")
    .set("Fakultät Bauingenieurwesen", "#F39100")
    .set("Fakultät Kunst und Gestaltung", "#94C11C")
    .set("Fakultät Medien", "#006B94")
    .set("Sonstiges", "grey")

  // return faculty color if defined else return grey
  function color(faculty) {
    var color = colors.get(faculty)
    if (color == undefined) {
      return "grey"
    } else return color
  }

   // fetch url search parameter for lecturer
  const urlSearchParams = new URLSearchParams(window.location.search);
  var searchParam = urlSearchParams.get('lecturer');
  if (searchParam != undefined) {
    var description = d3.select("#description").text("")
    description.append("c").text("Diese Visualisierung zeigt alle Kurse von ")
    description.append("strong").text(searchParam)
    description.append("c").text(" im aktuellen Semester. (")
    description.append("a").attr("href", "/code/parallel_sets").text("Auswahl aufheben")
    description.append("c").text(")")
    keys = ["courseType", "language", "day", "sws"]
    var color_keys = []
    bisond.forEach(entry => {
      if (!color_keys.includes(entry[keys[0]])) {
        color_keys.push(entry[keys[0]])
       }
    })
    color_keys = d3.sort(color_keys)
    bisond = bisond.filter(d => {
      var inside = false
      d.lecturers.forEach(l => {
        if (l.name == searchParam) {
          inside = true
        }
      })
      return inside
    })
    color = (ckey) => {
      return d3.interpolateSpectral(color_keys.indexOf(ckey) / (color_keys.length-1))
    }
  }

  bisond.map((d) => {
    if (d.sws <= 3) d.sws = "0-3"
    else if (d.sws <= 6) d.sws = "4-6"
    else if (d.sws <= 12) d.sws = "8-12"
    else if (d.sws <= 18) d.sws = "16-18"
    else d.sws = "Keine Angabe"
    return d    
  })

  output_selection(bisond)

  var width = 975
  var height = 720
  

  var data = bisond

  var selection = keys.map(d => new Set())

  
  var svg = d3.select("#parallel_set").attr("width", width).attr("height", height); 

  const weekdays = ["Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa.", "So.", "missing"]
  const weekday_sorter = {
    "Mo.": 1,
    "Di.": 2,
    "Mi.": 3,
    "Do.": 4,
    "Fr.": 5,
    "Sa.": 6,
    "So.": 7,
    "missing": 8,
  };

  const sws = ["0-3", "4-6", "8-12", "16-18", "Keine Angabe"]
  const sws_sorter = new Map()
  sws.forEach((d, i) => sws_sorter.set(d, i))
  console.log(sws_sorter)


  var sankey = Sankey()
        .nodeSort((a, b) => sort_attribute(a.name, b.name))
        .linkSort((a, b) => {return (a.names[0] == b.names[0]) ? sort_attribute(a.names[a.names.length - 1], b.names[b.names.length - 1]): sort_attribute(a.names[0], b.names[0])})
        .nodeWidth(8)
        .nodePadding(20)
        .extent([[0, 5], [width, height- 5]])

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

  // Legend
  d3.select("#legend").attr("width", width).attr("height", 30).append("g")
  .style("font", "10px sans-serif")
  .selectAll("text")
  .data(keys)
  .join("text")
  .attr("x", (d, i) => i * width/(keys.length-1) )
  .attr("y", 20)
  .attr("dy", "0.35em")
  .attr("text-anchor", (d, i) => i * width/(keys.length-1) < width / 2 ? "start" : "end")// 
  .append("tspan")
  .attr("fill-opacity", 0.7)
  .text(d => d);
  
  svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("fill", "LightGrey")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0 - 5)
      .attr("height", d => d.y1 - d.y0 + 10)
      .attr("width", d => d.x1 - d.x0)
      // click function to fill bars
      .on("click", function(e, d) { 
        if (d3.select(this).attr("fill") == "red") {
          selection[d.depth].delete(d.name)
          generate_selection()
          d3.select(this).attr("fill", "LightGrey")
        } else {
          selection[d.depth].add(d.name)
          generate_selection()
          d3.select(this).attr("fill", "red")
        }
        redraw()
      })
      .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .attr("fill", "none")
      .selectAll("path")
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
 
  /**
   * compare two different attributes
   *
   * @param a attribute value
   * @param b attribute value
   */
  function sort_attribute(a, b) {
    {
      if (weekdays.includes(a) && weekdays.includes(b)) {
        return weekday_sorter[a] > weekday_sorter[b];
      } else if (sws.includes(a) && sws.includes(b)) { 
        return sws_sorter.get(a) > sws_sorter.get(b);
      } else {
         return a > b}
    }
  }
    
  /**
   * function to evaluate if a path is in the current selection
   *
   * @param names An array of the attribute names the path belongs to 
   */
  function is_selected(names) {
    for (var i = 0; i < names.length; i++) {
      if ((selection[i].size != 0) && (!selection[i].has(names[i]))) return false
    }
    return true
  }
  
  /**
   * function to redraw graph when clicking on attribute 
   */
  function redraw() {
    svg.selectAll("path")
      .data(links)
      .join("path")
      .attr("d", SLH())
      .attr("stroke", d => (is_selected(d.names)) ? color(d.names[0]) : "Ash")
      .attr("stroke-width", d => d.width)
      .style("mix-blend-mode", "multiply")
      .append("title")
      .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);
  }

  /**
   * Generate an array of course objects from the selection
   */
  function generate_selection() {
    var fdata = bisond
    selection.forEach((category, i) => {
      var data_per_category = []
      if (category.size > 0) {
        category.forEach(selected_item => {
          var filtered_data = fdata.filter(d => d[keys[i]] == selected_item) 
          data_per_category = data_per_category.concat(filtered_data)
        })
        fdata = data_per_category
      } 
    })
    output_selection(fdata)
  }

  /**
   * Write selection in a table on the html site
   *
   * @param selection An array of course objects
   */
  function output_selection(selection) {
    var table = d3.select("div#result").select("#resulttable")
    table.selectAll("tr").remove()

    // generate table header
    var table_header = table.append("tr")
    table_header.append("th").text("Veransstaltungstitel")
    table_header.append("th").text("Lehrpersonen")

    if (selection.length == 0) {
      var table_row = table.append("tr")
      table_row.append("td").text("Es konnten keine Veranstaltungen für die aktuelle Auswahl gefunden werden.")
      table_row.append("td")
    } else {

      // generate base url to the lecturer network visualisation
      var lecturer_network_url = window.location.toString().split("/")
      if (lecturer_network_url[lecturer_network_url.length -1] == "") lecturer_network_url.pop()
      lecturer_network_url.pop()
      lecturer_network_url.push("lecturer_network")
      lecturer_network_url = new URL(lecturer_network_url.join("/"))   

      // generate entry for each course in the selection
      selection.forEach(course => {
        var table_row = table.append("tr")

        // write course title with link to bison in the table
        table_row.append("td").append("a")
          .attr("href", course.internalLink)
          .text(course.courseTitle)

        // write lecturers with custom query link to our lecturer network in the table
        var lec_item = table_row.append("td")
        if (course.lecturers.length > 1) {
        course.lecturers.forEach((lecturer) => {
          lecturer_network_url.searchParams.set("lecturer", lecturer.name)
          lec_item.append("a")
          .attr("href", lecturer_network_url.href)
          .text(lecturer.name)
          lec_item.append("text").text(", ")
          lec_item.append("br")
          }
        )} else {
          lecturer_network_url.searchParams.set("lecturer", course.lecturers[0].name)
          lec_item.append("a")
          .attr("href", lecturer_network_url.href)
          .text(course.lecturers[0].name)
        }
      });
    }
  }
});

