
d3.json("data/buildings.json").then(function (data) {
    console.log("Buildings data loaded:", data);


    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", 800)
        .attr("height", 600);


    const maxHeight = d3.max(data, d => d.height);
    const heightScale = 200 / maxHeight;

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 90 + 20)
        .attr("y", d => 450 - d.height * heightScale)
        .attr("width", 40)
        .attr("height", d => d.height * heightScale)
        .attr("fill", "steelblue")
        .attr("stroke", "#333")
        .attr("stroke-width", 1);

    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 100 + 20)
        .attr("y", 470)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .text(d => d.name);

}).catch(function (error) {
    console.log("Error loading data:", error);
});