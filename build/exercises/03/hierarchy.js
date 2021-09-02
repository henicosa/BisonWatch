import { hierarchy, rollup, sum} from "../../_snowpack/pkg/d3.js";

export function createHierarchy({data, attributeOrder}) {
    let tree = hierarchy(rollup(data, values => values.length, ...attributeOrder.map((d) => ((key) => key[d]))));
    tree.descendants().forEach(node => {node.data = {name: node.data[0], nrItems: sum(node.leaves(), node => node.data[1])}});
    return tree;
}