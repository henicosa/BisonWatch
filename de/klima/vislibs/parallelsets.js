import * as d3 from "d3";
import { path } from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

/* Function to plot parallel sets from slice and dice rectangles 
  - svg: d3 selection of svg element
  - hierarchy: hierarchy of attributess
  */
export function parallelsets({svg, hierarchy}) {
  let names = [];
  const graph = {
    links: hierarchy
    .links()
    .map(link => (
      {source: link.source.data.name, 
        target: link.target.data.name, 
        value: link.target.data.nrItems, 
        path:link.target.ancestors().map(node => node.data.name).reverse().slice(1)
      }))
      .filter((link) => link.source != undefined),
    nodes: hierarchy
    .descendants()
    .map(node => ({name: node.data.name, depth: node.depth}))
    .filter(node => {
      let alreadySeen = names.includes(node.name);
      if(!alreadySeen)
        names.push(node.name);
      return !alreadySeen && node.name != undefined;
    })
  };

  // Standard setup
  let width = 1000;
  let height = 600;
  let margin = { top: 5, right: 0, bottom: 0, left: 0 };

  svg.attr("viewBox", [0, 0, width, height]);

  // Utilize sankey to create layout
  const { nodes, links } = sankey()
    .nodeId((d) => d.name)
    .nodeWidth(10)
    .nodePadding(2)
    .nodeSort((a, b) => d3.ascending(a.name, b.name))
    .linkSort((a, b) =>(a.path.map((_, i) => d3.ascending(a.path[i], b.path[i]))).reduce((acc, value) => (acc || value), 0))
    .extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom],
    ])(graph);

  // create color map similar to the color map in mosaic plot
  const colorMap = d3
    .scaleOrdinal()
    .domain(
      Array.from(new Set(graph.nodes.filter(node => node.depth == 0).map(node => node.name))).sort()
    )
    .range(d3.schemePastel1);

  // Visual repesentations for the nodes 
  svg
    .append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .append("title")
    .text((d) => `${d.name}\n${d.value.toLocaleString()}`);

  // Visual representations for the links
  svg
    .append("g")
    .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", (d) => colorMap(d.path[0]))
    .attr("stroke-width", (d) => d.width)
    .style("mix-blend-mode", "multiply")
    .append("title")
    .text((d) => `${d.path.join(" → ")}\n${d.value.toLocaleString()}`);

  // Insert the labels
  svg
    .append("g")
    .style("font", "10px sans-serif")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
    .attr("y", (d) => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
    .text((d) => d.name)
    .append("tspan")
    .attr("fill-opacity", 0.7)
    .text((d) => ` ${d.value.toLocaleString()}`);
}
