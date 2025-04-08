
// Let´s start with the csv file.
d3.csv("data/ages.csv").then((data) => {
    console.log("CSV data:");
    console.log(data);
}).catch((error) => {
    console.log("Error loading CSV file:");
    console.log(error);
});

// Try with the tsv file.
d3.tsv("data/ages.tsv").then((data) => {
    console.log("TSV data:");
    console.log(data);
}).catch((error) => {
    console.log("Error loading TSV file:");
    console.log(error);
});

// finally with the json file.
d3.json("data/ages.json").then((data) => {
    console.log("JSON data (before parsing):");
    console.log(data);

    data.forEach((d) => {
        d.age = +d.age;
    });

    console.log("JSON data (after parsing):");
    console.log(data);

    // Add the SVG canvas
    var svg = d3.select("#chart-area").append("svg")
        .attr("width", 400)
        .attr("height", 400);

    // Bind the inforation read to the circles
    var circles = svg.selectAll("circle")
        .data(data);

    // Create the circle objects as we did previously in the Data Binding lesson
    circles.enter()
        .append("circle")
        .attr("cx", function (d, i) {
            return 50 + i * 50;
        })
        .attr("cy", 200)
        .attr("r", function (d) {
            return d.age;
        })
        .attr("fill", function (d) {
            return d.age > 10 ? "red" : "steelblue";
        });

}).catch((error) => {

    console.log("Error loading JSON file:");
    console.log(error);
});

d3.json("data/nonexistent-file.json").then((data) => {
    console.log(data);
}).catch((error) => {
    console.log("Error loading non-existent file:");
    console.log(error);
});
