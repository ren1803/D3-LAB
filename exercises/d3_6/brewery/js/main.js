var margin = { top: 40, right: 30, bottom: 100, left: 100 };
var width = 700 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var flag = true;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "#f9f9f9")
    .style("border-radius", "8px");

var g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var x = d3.scaleBand()
    .range([0, width])
    .paddingInner(0.4)
    .paddingOuter(0.4);

var y = d3.scaleLinear()
    .range([height, 0]);

var xAxisGroup = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

var yAxisGroup = g.append("g")
    .attr("class", "y-axis");

g.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text("Star Lion Brewery - Monthly Performance");

g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 70)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#333")
    .text("Month (2023)");

var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#333");

const gradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "bar-gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#FFD700")
    .attr("stop-opacity", 1);

gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#DAA520")
    .attr("stop-opacity", 0.8);

d3.json("data/revenues.json").then((data) => {
    data.forEach((d) => {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(() => {
        flag = !flag;
        update(data);
    }, 2000);

    update(data);

}).catch((error) => {
    console.log(error);
});

function update(data) {
    var value = flag ? "revenue" : "profit";
    var label = flag ? "Revenue ($)" : "Profit ($)";

    x.domain(data.map(d => d.month));
    y.domain([0, d3.max(data, d => d[value]) * 1.1]);

    var xAxisCall = d3.axisBottom(x);
    xAxisGroup.call(xAxisCall)
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("fill", "#555");

    var yAxisCall = d3.axisLeft(y)
        .ticks(8)
        .tickFormat(d => `$${d3.format(",.0f")(d)}`);

    yAxisGroup.call(yAxisCall)
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("fill", "#555");

    g.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    yLabel.text(label);

    // JOIN
    var bars = g.selectAll("rect")
        .data(data);

    // EXIT
    bars.exit().remove();

    // UPDATE
    bars
        .transition()
        .duration(750)
        .attr("x", d => x(d.month))
        .attr("y", d => y(d[value]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[value]));

    // ENTER
    bars.enter()
        .append("rect")
        .attr("x", d => x(d.month))
        .attr("y", d => y(d[value]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[value]))
        .attr("fill", "url(#bar-gradient)")
        .attr("stroke", "#DAA520")
        .attr("stroke-width", 1)
        .attr("rx", 4)
        .attr("ry", 4);

    // Remove old value labels
    g.selectAll(".value-label").remove();

    // Add new value labels
    g.selectAll(".value-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "value-label")
        .attr("x", d => x(d.month) + x.bandwidth() / 2)
        .attr("y", d => y(d[value]) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#555")
        .text(d => `$${d3.format(",.0f")(d[value])}`);
}