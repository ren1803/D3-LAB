var margin = { top: 10, right: 10, bottom: 100, left: 100 };
var width = 600 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "#f9f9f9")
    .style("border-radius", "8px");

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand().range([0, width]).padding(0.2);
var y = d3.scaleLinear().range([height, 0]);

var xAxisGroup = g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")");
var yAxisGroup = g.append("g").attr("class", "y axis");

g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 60)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Month");

var yLabel = g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Revenue (dlls.)");


g.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "#333")
    .text("Star Lion Brewery - Monthly Performance");

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

var showRevenue = true;

d3.json("data/revenues.json").then((data) => {
    data.forEach(d => {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });

    d3.interval(() => {
        showRevenue = !showRevenue;
        var newData = showRevenue ? data : data.slice(1);
        update(newData);
    }, 1000);

    update(data);
}).catch(error => console.log(error));

function update(data) {
    var value = showRevenue ? "revenue" : "profit";

    x.domain(data.map(d => d.month));
    y.domain([0, d3.max(data, d => d[value]) * 1.1]);


    xAxisGroup.transition().duration(750)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10)
        .attr("text-anchor", "end");

    yAxisGroup.transition().duration(750)
        .call(d3.axisLeft(y)
            .ticks(8)
            .tickFormat(d => `$${d3.format(",.0f")(d)}`));


    yLabel.text(showRevenue ? "Revenue (dlls.)" : "Profit (dlls.)");

    var bars = g.selectAll("rect").data(data, d => d.month);


    bars.exit()
        .transition().duration(750)
        .attr("y", height)
        .attr("height", 0)
        .remove();


    bars.enter().append("rect")
        .attr("x", d => x(d.month))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "url(#bar-gradient)")
        .attr("stroke", "#DAA520")
        .attr("stroke-width", 1)
        .attr("rx", 4)
        .attr("ry", 4)
        .merge(bars)
        .transition().duration(750)
        .attr("x", d => x(d.month))
        .attr("y", d => y(d[value]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[value]));


    g.selectAll(".value-label").remove();
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