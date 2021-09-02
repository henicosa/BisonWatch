import * as d3 from "../../_snowpack/pkg/d3.js";

/* Function to draw parallel coordinates
- svg: d3 selection of an svg element
- data: input dataset (in our case the movies dataset)
- attributes: array of [attribute name string, attribute accessor]
*/
export function parallelcoordinates({svg, data, attributes}) {
    // Standard setup of the visualization
    let width = 1000;
    let height = 800;
    let margin = { top: 30, right: 50, bottom: 10, left: 50 };

    // Setup the coordinate system of the svg
    svg.attr("viewBox", [0, 0, width, height]);

    // Set up the axes for the parallel coordinates
    // set the spacing of our axes
    const x = d3.scalePoint().domain(attributes.map(d => d[0])).range([margin.left, width - margin.right]);
    // create one scale for each given attribute and store them in a map
    const y = new Map(Array.from(attributes, attribute => [attribute[0], (attribute[1](data[0]) instanceof Date)?d3.scaleTime(d3.extent(data, d => attribute[1](d)), [height - margin.bottom, margin.top]): d3.scaleLinear(d3.extent(data, d => attribute[1](d)), [height - margin.bottom, margin.top])]));

    // set up the colors for forground and background lines
    const deselectedColor = "#ddd";
    const activeColor = "darkslateblue";

    // Set up the extents of the brush for each axis
    const brushWidth = 50;
    const brush = d3.brushY()
      .extent([
        [-(brushWidth / 2), margin.top],
        [brushWidth / 2, height - margin.bottom]
      ])
      .on("start brush end", brushed);

    // draw the lines, one for each data item in the dataset
    const path = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.4)
        .selectAll("path")
        .data(data)
        .join("path")
        .attr("stroke", "darkslateblue")
        .attr("d", d => drawLine({datum: attributes.map(attribute => [attribute[0], attribute[1](d)]), xScale: x, yScales: y}));

    // set a title to show the film title on hover
    path.append("title")
        .text(d => d.title);
  
    // draw the axes for the parallel coordinates
    svg.append("g")
      .selectAll("g")
      .data(attributes)
      .join("g")
        .attr("transform", d => `translate(${x(d[0])},0)`)
        .each(function(d) { d3.select(this).call(d3.axisLeft(y.get(d[0]))); })
        .call(g => g.append("text")
          .attr("x", 0)
          .attr("y", margin.top - 6)
          .attr("text-anchor", "middle")
          .attr("fill", "currentColor")
          .text(d => d[0]))
        .call(g => g.selectAll("text")
          .clone(true).lower()
          .attr("fill", "none")
          .attr("stroke-width", 5)
          .attr("stroke-linejoin", "round")
          .attr("stroke", "white"))
        .call(brush);
  
    // prepare the selection via brushing 
    const selections = new Map();
  
    // the brushing functionality
    function brushed({selection}, attribute) {
      // remove the brushing filter if there is no selection for the attribute
      if (selection === null) selections.delete(attribute[0]);
      // else calculate the selected extent from the brush  
      else selections.set(attribute[0], {extent: selection.map(y.get(attribute[0]).invert), accessor: attribute[1]});
      // check for each path, whether it is within the selection or not
      path.each(function(d) {
        // the array.every() checks for each entry whether a condition holds and
        // returns true only if all single contitions are met
        const active = Array.from(selections).every((entry) => {
            return entry[1].accessor(d) >= entry[1].extent[1] && entry[1].accessor(d) <= entry[1].extent[0];
        });
        // color the path accordingly
        d3.select(this).style("stroke", active ? activeColor : deselectedColor);
        // raise (so draw in front of everything else) the element if active
        if (active) {
          d3.select(this).raise();
        }
      });
    }
    
}
/* Function to transform a data item to a polyline
- datum: array containing the data item of form [[attr1, value1], [attr2, value2], ...] 
- xScale: point scale to map the attribute name to an x coordinate
- yScale: map of scales to map attribute value to y coordinate. 
          Access each scale via yScale.get(your attribute name)(your attribute value)
RETURN: string definition of svg path
*/ 
function drawLine({datum, xScale, yScales}) {
    // DONE: Task 0: draw the line for the given data item
    // Set up the line generator to create the path 
    var path = 'M ' + String(xScale(datum[0][0])) + ',' + String(Math.round(yScales.get(datum[0][0])(datum[0][1])));
    for (var i = 1; i < datum.length; i++) {
      path = path + ' L ' + String(xScale(datum[i][0])) + ',' + String(Math.round(yScales.get(datum[i][0])(datum[i][1])));
    }
    return path;
}