
// 3. Create an svg canvas of 500 x 500
var svg = d3.select("#chart-area").append("svg")
    .attr("width", 500)
    .attr("height", 500);

// Load and process the data
d3.json("data/buildings.json").then(data => {
    console.log(data);

    // Ensure height is a number
    data.forEach(d => {
        d.height = +d.height;
    });

    // 5. Create a scale band for the x axis
    // Domain: List of buildings
    // Range: Width of Canvas (0 - 400)
    // Inner and outer padding: 0.3
    var x = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, 400])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    // 6. For the y axis create a linear scale
    // Domain: Height of buildings (0 - 828)
    // Range: Height of Canvas (0 - 400)
    var y = d3.scaleLinear()
        .domain([0, 828])  // Usando el valor específico 828 como se pide
        .range([0, 400]);

    // 7. Create an ordinal scale to map every building to a color in the d3.schemeSet3 color scheme
    var color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.schemeSet3);

    // 4. Use a data join to add a rectangle for each building in the dataset to your SVG
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.name))
        .attr("y", 0)
        .attr("width", x.bandwidth())
        .attr("height", d => y(d.height))
        .attr("fill", d => color(d.name))
        .attr("stroke", "#333")
        .attr("stroke-width", 1);

    // Añadir etiquetas para los nombres de los edificios
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x(d.name) + x.bandwidth() / 2)
        .attr("y", 430)
        .attr("transform", d => `rotate(45, ${x(d.name) + x.bandwidth() / 2}, 430)`)
        .attr("text-anchor", "start")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(d => d.name);

}).catch(function (error) {
    console.log("Error loading data:", error);
});