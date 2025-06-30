import * as d3 from "d3";
import { loadBisonDataset, global_settings } from "../../bison.js";


// Importe für alte Visualisierungen
/*import { discretize } from "./vislibs/discretize";
import { parallelsets } from "./vislibs/parallelsets";
import { mosaicplot, sliceAndDice } from "./vislibs/mosaicplot";
import { createHierarchy } from "./vislibs/hierarchy";
import marked from "marked";
import whatwhyhow from "./whatwhyhow.md";
import { parallelcoordinates } from "./parallelcoordinates";

English Version
*/

var dataset = "../../data/" + global_settings["most_recent_dataset"]["id"] + ".csv"

// Laden der Bisondaten
loadBisonDataset(dataset).then((bisond) => {
  var height = 500
  var width = 932

  const svg = d3.select("#alphabet")
    .attr("viewBox", [0, 0, width, height]);

  const svg2 = d3.select("#legend")

  // Create legend vertical 
  svg2.append("circle").attr("cx",10).attr("cy",25).attr("r", 6).style("fill", "#009BB4")
  svg2.append("circle").attr("cx",10).attr("cy",45).attr("r", 6).style("fill", "#F39100")
  svg2.append("circle").attr("cx",10).attr("cy",65).attr("r", 6).style("fill", "#94C11C")
  svg2.append("circle").attr("cx",10).attr("cy",85).attr("r", 6).style("fill", "#006B94")
  svg2.append("circle").attr("cx",10).attr("cy",105).attr("r", 6).style("fill", "grey")
  svg2.append("text").attr("x", 20).attr("y", 30).text("Faculty of Architecture and Urban Studies")
  svg2.append("text").attr("x", 20).attr("y", 50).text("Faculty of Civil Engineering").attr("alignment-baseline","middle")
  svg2.append("text").attr("x", 20).attr("y", 70).text("Faculty of Art and Design",).attr("alignment-baseline","middle")
  svg2.append("text").attr("x", 20).attr("y", 90).text("Faculty of Media").attr("alignment-baseline","middle")
  svg2.append("text").attr("x", 20).attr("y", 110).text("Other").attr("alignment-baseline","middle") 


  var translator = {
    "faculty": "Faculty",
    "language": "Language",
    "day": "Day",
    "Day": "day",
    "SWS": "sws",
    "sws": "SWS",
    "courseType": "Course type",
    "Course type": "courseType",
    "Language": "language",
    "Faculty": "faculty",
    "Mo." : "Mo.",
    "Di." : "Tu.",
    "Mi." : "We.",
    "Do." : "Th.",
    "Fr." : "Fr.",
    "Sa." : "Sa.",
    "So." : "Su.",
    "missing" : "Not specified", 
    "Fakultät Bauingenieurwesen" : "Faculty of Civil Engineering",
    "Fakultät Architektur und Urbanistik" : "Faculty of Architecture and Urbanism",
    "Fakultät Medien" : "Faculty of Medien",
    "Fakultät Kunst und Gestaltung" : "Faculty of Art and Design",
    "Zentrale Veranstaltungen der Universität" : "Central events of the university",
    "Lehrveranstaltungen der Bauhaus.Module" : "Courses only included in the Bauhaus.Modules", 
    "deutsch" : "German",
    "englisch" : "English",
    "deutsch/englisch" : "German/English",
    "deutsch/französisch" : "German/French",
    "französisch" : "French",
    "deutsch oder englisch (gemeinsame Festlegung)" : "German or English (joint vote)",
    "deutsch und englisch (zweisprachig)" : "German and English (bilingual)",
    "deutsch und französisch (zweisprachig)" : "German and French (bilingual)",
    "NaN" : "Not specified"
  }

  function translate(word) {
    if (translator[word] != undefined)
      return translator[word]
    return word
  }
  
  const attributeSelect = d3.select("select#attribute");

  const possibleAttributes = ["day", "language", "sws", "courseType", "faculty"];

  // setup the combobox with all attributes
  attributeSelect
    .selectAll("option")
    .data(possibleAttributes)
    .join("option")
    .text((attribute) => translate(attribute));

  // initialize
  update(svg, attributeSelect, bisond, height, width, translate)
  // update the histogram every time the chosen attribute is changed
  attributeSelect.on("change", () => update(svg, attributeSelect, bisond, height, width, translate))

});

function update(svg, attributeSelect, bisond, height, width, translate) {
  var margin = ({top: 80, right: 0, bottom: 150, left: 40})
  var color = "steelblue"

  svg.selectAll("g").remove()

  const attribute = translate(attributeSelect.property("value"));

  const sorter = {
    "Mo.": 1,
    "Di.": 2,
    "Mi.": 3,
    "Do.": 4,
    "Fr.": 5,
    "Sa.": 6,
    "So.": 7,
    "missing": 8,
    "deutsch/englisch": 9
  };

  var type = ["Seminar","Vorlesung","Projektmodul","Integrierte Vorlesung","Sonstiges"];

  const get_att = {
    "sws": (d) => d.sws,
    "day": (d) => d.day,
    "courseType": (d) => d.courseType,
    "language": (d) => d.language,
    "faculty": (d) => d.faculty
  }


  var data = Array.from(d3.group(bisond, get_att[attribute]))

 /* if (attribute == "courseType") {
    type = type.map((d,i) => {
      if (d != "Sonstiges")
        return [d, data[i]];
      else {
        return [d, d3.sum(data, (d) => type.includes(d[0]) ? 0 : d[1])]
      }
    })
    data = type 
  } */


    var data = Array.from(d3.group(bisond, get_att[attribute]))

    var categories = ["AU", "BU", "KG", "M"]
  
    data = data.map((d) => {
      var roll = d3.rollup(d[1], v => v.length, 
        w => categories.includes(w.faculty) ? w.faculty: "Sonstiges" 
      )
      return {name: d[0].toString(), AU: roll.get("AU") != undefined ? roll.get("AU") : 0
        , B: roll.get("BU") != undefined ? roll.get("BU") : 0
        , KG: roll.get("KG") != undefined ? roll.get("KG") : 0
        , M: roll.get("M") != undefined ? roll.get("M") : 0
        , Sonstiges: roll.get("Sonstiges")!= undefined ? roll.get("Sonstiges") : 0} 
      }
    )
  
    var categories = ["AU", "KG", "M", "B", "Sonstiges"]
    var stack = d3.stack()
      .keys(categories)
  

  //console.log(data)

  
  if (attribute == "day") data = data.sort((a, b) => {return sorter[a.name] > sorter[b.name]})
  else if (attribute == "sws") data = data.sort((a,b) => {
    if (a.name == "NaN") return true
    else if (b.name == "NaN") return false
    else return Number(a.name) > Number(b.name)
  })
  else data = data.sort((a,b) => {return a.name > b.name})

  var colors = new Map().set("AU", "#009BB4")
                  .set("B", "#F39100")
                  .set("KG", "#94C11C")
                  .set("M", "#006B94")
                  .set("Sonstiges", "grey")

  var x = d3.scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.M + d.AU + d.KG + d.B + d.Sonstiges)]).nice()
    .range([height - margin.bottom, margin.top])

  var xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(i => (translate(data[i].name).length <=20) ? translate(data[i].name) : translate(data[i].name).slice(0, 17) + "...").tickSizeOuter(0))
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

  var cdata = stack(data)

  const groups = svg.append('g')
  // Each layer of the stack goes in a group
  // the group contains that layer for all countries
  .selectAll('g')
  .data( cdata )
  .join('g')
    // rects in the same layer will all have the same color, so we can put it on the group
    // we can use the key on the layer's array to set the color
    .style('fill', (d,i) => colors.get(d.key))

  groups.append("g")
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
      .attr("x", (d, i) => x(i))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .append("title")
        .text(d => (d[1]-d[0]).toString());

  svg.append("g")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);



}


