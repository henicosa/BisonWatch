import * as d3 from "d3";
import { loadKlimaDataset } from "../klima";


// Importe für alte Visualisierungen
/*import { discretize } from "./vislibs/discretize";
import { parallelsets } from "./vislibs/parallelsets";
import { mosaicplot, sliceAndDice } from "./vislibs/mosaicplot";
import { createHierarchy } from "./vislibs/hierarchy";
import marked from "marked";
import whatwhyhow from "./whatwhyhow.md";
import { parallelcoordinates } from "./parallelcoordinates";*/


// Laden der Klimadaten
loadKlimaDataset().then((klimad) => {
  var stratify = d3.stratify()
                    .id(d => d["child"])
                    .parentId(d => d["parent"]);
  var rootd = stratify(klimad);

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



