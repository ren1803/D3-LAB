
var margin = { top: 20, right: 300, bottom: 30, left: 50 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left +
        "," + margin.top + ")");

// Time parser for x-scale
var parseDate = d3.timeParse('%Y');
var formatSi = d3.format(".3s");
var formatNumber = d3.format(".1f"),
    formatBillion = (x) => { return formatNumber(x / 1e9); };

// Scales
var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);
var color = d3.scaleOrdinal(d3.schemeSpectral[11]);

// Axis generators
var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft().tickFormat(formatBillion);

// Area generator
// Implemented TODO: create the area generator
var areaGenerator = d3.area()
    .x((d) => { return x(d.data.date); })
    .y0((d) => { return y(d[0]); })
    .y1((d) => { return y(d[1]); });

// Implemented TODO: create the stack
var stack = d3.stack()
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

// Axis groups
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis = g.append("g")
    .attr("class", "y axis");

// Y-Axis label
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Billions of liters");

// Legend code
var legend = g.append("g")
    .attr("transform", "translate(" + (width + 150) +
        "," + (height - 210) + ")");

d3.csv('data/stacked_area2.csv').then((data) => {
    // Set color domain
    color.domain(d3.keys(data[0]).filter((key) => {
        return key !== 'date';
    }));

    // Implemented TODO: obtain the keys array, remember to remove the first column
    var keys = d3.keys(data[0]).filter((key) => {
        return key !== 'date';
    });

    // Parse dates
    data.forEach((d) => {
        d.date = parseDate(d.date);
    });

    // Calculate max value
    var maxDateVal = d3.max(data, (d) => {
        var vals = d3.keys(d).map((key) => {
            return key !== 'date' ? d[key] : 0
        });
        return d3.sum(vals);
    });

    // Set domains
    x.domain(d3.extent(data, (d) => { return d.date; }));
    y.domain([0, maxDateVal]);

    // Generate axes once scales have been set
    xAxis.call(xAxisCall.scale(x))
    yAxis.call(yAxisCall.scale(y))

    // Implemented TODO: finish the configuration of the stack object
    // by setting the keys, order and offset
    stack.keys(keys);

    // Implemented TODO: bind the data to the stack and create the group 
    // that will contain the area path
    var stackedData = stack(data);

    // Implemented TODO: call the area generator with the appropriate data
    // and display every area created with the stack
    g.selectAll(".area")
        .data(stackedData)
        .enter().append("path")
        .attr("class", "area")
        .attr("d", areaGenerator)
        .style("fill", (d) => { return color(d.key); })
        .style("fill-opacity", 0.7);

    // Implemented TODO: Create a legend showing all the names of every color
    var legendRows = legend.selectAll(".legendRow")
        .data(keys)
        .enter().append("g")
        .attr("class", "legendRow")
        .attr("transform", (d, i) => { return "translate(0," + i * 20 + ")"; });

    legendRows.append("rect")
        .attr("x", 0)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", (d) => { return color(d); });

    legendRows.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text((d) => { return d; });

}).catch((error) => {
    console.log(error);
});