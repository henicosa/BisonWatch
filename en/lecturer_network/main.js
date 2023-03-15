import * as d3 from "d3";
//import { convertSkypackImportMapToLockfile } from "snowpack/lib/util";
import { loadBisonDataset, global_settings } from "../../bison.js";


// Importe für alte Visualisierungen
/*import { discretize } from "./vislibs/discretize";
import { parallelsets } from "./vislibs/parallelsets";
import { mosaicplot, sliceAndDice } from "./vislibs/mosaicplot";
import { createHierarchy } from "./vislibs/hierarchy";
import marked from "marked";
import whatwhyhow from "./whatwhyhow.md";
import { parallelcoordinates } from "./parallelcoordinates";*/

var dataset = "../../data/" + global_settings["most_recent_dataset"]["id"] + ".csv"

const urlSearchParams = new URLSearchParams(window.location.search);
var historic_data = urlSearchParams.get('historic');
if (historic_data != undefined && historic_data == "yes") {
    historic_data = true
    d3.select("#historic")._groups[0][0].checked = true
    dataset = "../../data/bisondata.csv"
    d3.select("#description").text("This visualisation shows the lecturers of the Bauhaus University and their shared courses since and including winter semester 2019/20.")
} else historic_data = false

// Laden der Bison-Daten
loadBisonDataset(dataset).then((bisond) => {

    // generate base url to the parralel sets visualisation
    var selector_url = window.location.toString().split("/")
        // pop query string
    selector_url.pop()
        // pop visualiser reference
    selector_url.pop()
    selector_url.push("parallel_sets/")
    selector_url = new URL(selector_url.join("/"))

    var blacklist = ["N.N", "N.N.", " N.N.", "missing", "keine öffentliche Person", " ", ""]
    var categories = ["Fakultät Architektur und Urbanistik", "Fakultät Bauingenieurwesen", "Fakultät Kunst und Gestaltung", "Fakultät Medien"]

    const svg2 = d3.select("#legend")

    // Create legend vertical 
    svg2.append("circle").attr("cx", 10).attr("cy", 25).attr("r", 6).style("fill", "#009BB4")
    svg2.append("circle").attr("cx", 10).attr("cy", 45).attr("r", 6).style("fill", "#F39100")
    svg2.append("circle").attr("cx", 10).attr("cy", 65).attr("r", 6).style("fill", "#94C11C")
    svg2.append("circle").attr("cx", 10).attr("cy", 85).attr("r", 6).style("fill", "#006B94")
    svg2.append("circle").attr("cx", 10).attr("cy", 105).attr("r", 6).style("fill", "grey")
    svg2.append("text").attr("x", 20).attr("y", 30).text("Faculty of Architecture and Urbanism")
    svg2.append("text").attr("x", 20).attr("y", 50).text("Faculty of Civil Engineering").attr("alignment-baseline", "middle")
    svg2.append("text").attr("x", 20).attr("y", 70).text("Faculty of Art and Design", ).attr("alignment-baseline", "middle")
    svg2.append("text").attr("x", 20).attr("y", 90).text("Faculty of Media").attr("alignment-baseline", "middle")
    svg2.append("text").attr("x", 20).attr("y", 110).text("Other").attr("alignment-baseline", "middle")

    var lecturers = new Map();
    bisond.forEach(element => {
        element.lecturers.forEach(lecturer => {
            if (!blacklist.includes(lecturer.name) && lecturer.name != undefined) {
                if (!lecturers.has(lecturer.name)) lecturers.set(lecturer.name, {
                        courses: new Set(),
                        colecturers: new Map(),
                        faculty: categories.includes(lecturer.faculty) ? lecturer.faculty : "Sonstiges"
                    })
                    // update colectureres
                var colecturers = lecturers.get(lecturer.name).colecturers
                element.lecturers.forEach(lecturerB => {
                        if ((lecturerB.name != lecturer.name) && (!blacklist.includes(lecturerB.name)))
                            if (colecturers.has(lecturerB.name))
                                colecturers.set(lecturerB.name, colecturers.get(lecturerB.name) + 1)
                            else
                                colecturers.set(lecturerB.name, 1)
                    })
                    // update course
                lecturers.get(lecturer.name).courses.add(element)
            }
        });
    });

    const datalist = d3.select("#search")
    lecturers.forEach((d, lecturer) => {
        datalist.append("option")
            .attr("value", lecturer)
    })

    const attributeSelect = d3.select("#search_input")
    const historicSelect = d3.select("#historic")

    var lecturer_selected = false
    var force_selection = false
    var lecturer_selected_name = ""
    var lecturer_force_selected_name = ""

    attributeSelect.on('input', function(e) {
        //if (e.key === 'Enter') {
        var input = d3.select("#search_input").property("value")
        if (lecturers.has(input))
            make_selection(input)
            //}
    });

    historicSelect.on('change', function(e) {
        if (d3.select("#historic")._groups[0][0].checked) {
            window.open("?historic=yes", "_top")
        } else {
            window.open("../../en/lecturer_network/", "_top")
        }
    });


    var height = 800
    var width = 1000

    var colors = new Map().set("Fakultät Architektur und Urbanistik", "#009BB4")
        .set("Fakultät Bauingenieurwesen", "#F39100")
        .set("Fakultät Kunst und Gestaltung", "#94C11C")
        .set("Fakultät Medien", "#006B94")
        .set("Sonstiges", "grey")

    const scale = d3.scaleLinear()
        .domain([0, 16, 50])
        .range(["grey", "blue", "red"]);

    var mdata = { nodes: [], links: [] };
    lecturers.forEach((value, lecturer_name) => {
        mdata.nodes.push({ id: lecturer_name, group: value.courses.size, faculty: value.faculty })
        value.colecturers.forEach((lecture_num, colecturer_name) => {
            if (lecturer_name < colecturer_name) {
                mdata.links.push({ source: lecturer_name, target: colecturer_name, value: lecture_num })
            }
        })
    })

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
        if (index < list.length - 2) {
            var bogen = 2 * Math.PI / (list.length - 1)
            return { x: diam * Math.cos(bogen * index), y: diam * Math.sin(bogen * index) }
        } else return { x: 0, y: 0 }
    }

    categories.push("Sonstiges")
    var force_map = new Map()
    categories.forEach((d) => { force_map.set(d, get_force(categories, d)) })


    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX(d => force_map.get(d.faculty).x))
        .force("y", d3.forceY(d => force_map.get(d.faculty).y));

    const svg = d3.select("#lecturer_network")
        .attr("viewBox", [-width / 2, -height / 2, width, height])

    svg.call(d3.zoom()
        .extent([
            [0, 0],
            [width, height]
        ])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));

    var zoom = svg.append("g")


    function zoomed({ transform }) {
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
        .attr("r", d => 5 + parseInt(Math.log(d.group) / Math.log(1.5)))
        .attr("fill", d => lecturer_selected ? "LightGray" : colors.get(d.faculty))
        .call(drag(simulation))
        .on("mouseover", function(e) {
            d3.select(this).attr("r", d => 5 + parseInt(Math.log(d.group) / Math.log(1.5))).style("fill", d => {
                lecturer_selected = true
                lecturer_selected_name = d.id
                redraw()
                return (d.id == lecturer_force_selected_name) ? "red" : colors.get(d.faculty)
            });
        })
        .on("mouseout", function(e) {
            d3.select(this).attr("r", d => 5 + parseInt(Math.log(d.group) / Math.log(1.5))).style("fill", d => {
                lecturer_selected = false
                lecturer_selected_name = ""
                redraw()
                return colors.get(lecturer_selected ? "LightGray" : colors.get(d.faculty))
            });
        })
        .on("click", function(e, d) {
            if (lecturer_force_selected_name == d.id) {
                remove_selection()
                d3.select(this).style("fill", colors.get(d.faculty))
            } else {
                make_selection(d.id)
                d3.select(this).style("fill", "red")
            }
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

    // fetch url search parameter for lecturer
    const urlSearchParams = new URLSearchParams(window.location.search);
    var searchParam = urlSearchParams.get('lecturer');
    if (searchParam != undefined) {
        make_selection(searchParam)
    }

    // function to redraw the graph on mouseover event
    function redraw() {
        zoom.selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", d => 5 + parseInt(Math.log(d.group) / Math.log(1.5)))
            .attr("stroke", d => (lecturer_selected && lecturer_selected_name == d.id) ?
                "red" :
                "white")
            .attr("stroke-width", d => (lecturer_selected && lecturer_selected_name == d.id) ?
                3 :
                2)
            .attr("fill", d => {
                if (!force_selection) {
                    if (lecturer_selected && !is_connected(lecturer_selected_name, d.id)) {
                        return "LightGray";
                    } else {
                        return colors.get(d.faculty);
                    }
                } else {
                    if (d.id == lecturer_force_selected_name) {
                        return "red";
                    } else if (is_connected(lecturer_force_selected_name, d.id)) {
                        return colors.get(d.faculty);
                    } else {
                        return "LightGray";
                    }
                }
            })
            .call(drag(simulation))
    }

    function select_teacher() {
        zoom.selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", d => 5 + parseInt(Math.log(d.group) / Math.log(1.5)))
            .attr("fill", d => (lecturer_selected && !is_connected(lecturer_selected_name, d.id)) ? lecturer_selected_name == d.id ? "red" : "LightGray" : colors.get(d.faculty))
            .call(drag(simulation))
    }

    function remove_selection() {
        force_selection = false
        lecturer_selected = false
        lecturer_selected_name = ""
        lecturer_force_selected_name = ""
        d3.select("#tip").select("div").remove()
        d3.select("#search_input").property("value", "")
        d3.select("#description").text("This visualisation shows the lecturers of the Bauhaus-Universität and their shared courses" + (historic_data ? " since and including winter semester 2019/20." : " in the current semester."))
    }


    function make_selection(input) {
        var description = d3.select("#description").text("")
        description.append("c").text("This visualisation shows the teacher ")
        description.append("strong").text(input)
        description.append("c").text(" and all teachers with shared courses " + (historic_data ? " since and including winter semester 2019/20." : " in the current semester."))

        selector_url.searchParams.set("lecturer", input)
        if (historic_data) selector_url.searchParams.set("historic", "yes")
        d3.select("#tip").select("div").remove()
        var tip = description //d3.select("#tip").append("div").text("")
        tip.append("c").text(" (")
        tip.append("a").attr("href", selector_url).text("Learn more about " + input + "'s courses.")
        tip.append("c").text(")")
        d3.select("#search_input").property("value", input)

        lecturer_selected_name = input;
        lecturer_selected = true

        force_selection = true
        lecturer_force_selected_name = input

        select_teacher()
    }

    //function to test if two nodes are connected:
    function is_connected(lecturer_A_name, lecturer_B_name) {
        return lecturers.get(lecturer_A_name).colecturers.has(lecturer_B_name)
    }

    //invalidation.then(() => simulation.stop());

});