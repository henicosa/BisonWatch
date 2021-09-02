import { hierarchy, rollup, sum} from "d3";

export function createHierarchy({data, attributeOrder}) {
    let tree = hierarchy(rollup(data, values => values.length, ...attributeOrder.map((d) => ((key) => key[d]))));
    tree.descendants().forEach(node => {node.data = {name: node.data[0], nrItems: sum(node.leaves(), node => node.data[1])}});
    return tree;
}