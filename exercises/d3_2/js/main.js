
// Create a list called data with the values 25, 20, 15, 10, 5.
var data = [25, 20, 15, 10, 5];

// Select the #chart-area to add an svg element of size 400 x 400.
var svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", 400)
    .attr("height", 400);

// Create a group element to hold our rectangles
var g = svg.append("g");

// Bind the data to a series of rectangles of width 40 where the binded data represent its height.
data.forEach(function (d, i) {
    g.append("rect")
        .attr("x", i * 45 + 60)
        .attr("y", 400 - (d * 8))
        .attr("width", 40)
        .attr("height", d * 8)
        .attr("fill", "orange");
});