// Using the select and append commands to add an svg tag. Select the #chart-area to add the element.
var svg = d3.select("#chart-area").append("svg")
    .attr("width", 400)
    .attr("height", 400);


//Add a circle to the svg with center at (100, 250) and a radius of 70 or color blue.
var circle = svg.append("circle")
    .attr("cx", 100)
    .attr("cy", 250)
    .attr("r", 70)
    .attr("fill", "blue");

// Add a rectangle with upper left corner at (20, 20) of width 20 and height 30 or color red.
var rect = svg.append("rect")
    .attr("x", 20)
    .attr("y", 20)
    .attr("width", 20)
    .attr("height", 30)
    .attr("fill", "red");

// Play around with the attributes to get familiar with them.
var square = svg.append("rect")
    .attr("x", 200)
    .attr("y", 150)
    .attr("width", 50)
    .attr("height", 50)
    .attr("fill", "green");  