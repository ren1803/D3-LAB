/*
    Adapted from Mike Bostock at bl.ocks.org
    https://bl.ocks.org/mbostock/5682158
*/

const margin = {
    top: 20,
    right: 300,
    bottom: 30,
    left: 50
};

const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const radius = Math.min(width, height) / 2;

const svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const chartGroup = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Donut chart arc generator
const arcGenerator = d3.arc()
    .innerRadius(radius * 0.4) // Creates donut chart effect
    .outerRadius(radius * 0.8);

// Pie layout generator
const pieGenerator = d3.pie()
    .value(d => d.count)
    .sort(null); // Preserve original order

// Data loading and processing
d3.tsv("data/donut2.tsv").then((data) => {
    // Transform data
    data.forEach(d => {
        d.count = +d.count;
        d.fruit = d.fruit.toLowerCase();
    });

    console.log(data);

    // Group data by fruit using deprecated d3.nest()
    const regionsByFruit = d3.nest()
        .key(d => d.fruit)
        .entries(data);

    console.log(regionsByFruit);

    // Create dynamic radio buttons
    const label = d3.select("form").selectAll("label")
        .data(regionsByFruit)
        .enter().append("label");

    label.append("input")
        .attr("type", "radio")
        .attr("name", "fruit")
        .attr("value", d => d.key)
        .on("change", update)
        .filter((d, i) => !i)
        .each(update)
        .property("checked", true);

    label.append("span")
        .attr("fill", "red")
        .text(d => d.key);

}).catch((error) => {
    console.log(error);
});

// Update chart based on selected region
function update(region) {
    let path = chartGroup.selectAll("path");

    const currentData = path.data();
    const newData = pieGenerator(region.values);

    // Join elements with new data
    path = path.data(newData, keyExtractor);

    // Remove old elements
    path.exit()
        .datum((d, i) => findNeighborArc(i, newData, currentData, keyExtractor) || d)
        .transition()
        .duration(750)
        .attrTween("d", arcTween)
        .remove();

    // Update existing elements
    path.transition()
        .duration(750)
        .attrTween("d", arcTween);

    // Add new elements
    path.enter()
        .append("path")
        .each(function (d, i) {
            this._current = findNeighborArc(i, currentData, newData, keyExtractor) || d;
        })
        .attr("fill", d => colorScale(d.data.region))
        .transition()
        .duration(750)
        .attrTween("d", arcTween);
}

// Extract region key for data binding
function keyExtractor(d) {
    return d.data.region;
}

// Find neighboring arc for smooth transitions
function findNeighborArc(index, data0, data1, keyFn) {
    const preceding = findPrecedingArc(index, data0, data1, keyFn);
    if (preceding) return {
        startAngle: preceding.endAngle,
        endAngle: preceding.endAngle
    };

    const following = findFollowingArc(index, data0, data1, keyFn);
    if (following) return {
        startAngle: following.startAngle,
        endAngle: following.startAngle
    };

    return null;
}

// Find preceding arc for transition
function findPrecedingArc(index, data0, data1, keyFn) {
    const dataLength = data0.length;
    while (--index >= 0) {
        const currentKey = keyFn(data1[index]);
        for (let j = 0; j < dataLength; ++j) {
            if (keyFn(data0[j]) === currentKey) return data0[j];
        }
    }
}

// Find following arc for transition
function findFollowingArc(index, data0, data1, keyFn) {
    const data1Length = data1.length;
    const data0Length = data0.length;

    while (++index < data1Length) {
        const currentKey = keyFn(data1[index]);
        for (let j = 0; j < data0Length; ++j) {
            if (keyFn(data0[j]) === currentKey) return data0[j];
        }
    }
}

// Interpolate arc for smooth transitions
function arcTween(d) {
    const interpolate = d3.interpolate(this._current, d);
    this._current = interpolate(1);
    return t => arcGenerator(interpolate(t));
}