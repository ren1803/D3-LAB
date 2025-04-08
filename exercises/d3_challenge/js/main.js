
// Load the buildings.json data file
d3.json("data/buildings.json").then(function (data) {
    console.log("Buildings data loaded:", data);

    // Create SVG container
    const svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", 800) // Increased SVG width to accommodate wider spacing
        .attr("height", 600);

    // Calculate scale for heights to fit in our SVG
    const maxHeight = d3.max(data, d => d.height);
    const heightScale = 200 / maxHeight;

    // Create a rectangle for each building
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 90 + 20) // Stagger by x-coordinates with more space (100px instead of 60px)
        .attr("y", d => 450 - d.height * heightScale) // Position from bottom
        .attr("width", 40)
        .attr("height", d => d.height * heightScale)
        .attr("fill", "steelblue")
        .attr("stroke", "#333")
        .attr("stroke-width", 1);

    // Add building names below each rectangle
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 100 + 20) // Center text under each building (adjusted for new spacing)
        .attr("y", 470)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .text(d => d.name);

}).catch(function (error) {
    console.log("Error loading data:", error);
});