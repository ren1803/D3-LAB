d3.json("data/revenues.json").then((data) => {
    data.forEach((d) => {
        d.month = d.month;
        d.revenue = +d.revenue;
    });
    console.log(data);

    var margin = { top: 40, right: 30, bottom: 100, left: 100 };
    var width = 700 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#chart-area")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "#f9f9f9")
        .style("border-radius", "8px");

    var g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("fill", "#333")
        .text("Star Lion Brewery - Monthly Revenue");

    const x = d3.scaleBand()
        .domain(data.map(d => d.month))
        .range([0, width])
        .paddingInner(0.4)
        .paddingOuter(0.4);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.revenue) * 1.1])
        .range([height, 0]);

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

    g.append("g")
        .attr("class", "grid")
        .attr("opacity", 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.month))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "url(#bar-gradient)")
        .attr("stroke", "#DAA520")
        .attr("stroke-width", 1)
        .attr("rx", 4)
        .attr("ry", 4)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr("y", d => y(d.revenue))
        .attr("height", d => height - y(d.revenue));

    g.selectAll(".revenue-value")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "revenue-value")
        .attr("x", d => x(d.month) + x.bandwidth() / 2)
        .attr("y", d => y(d.revenue) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#555")
        .text(d => `$${d3.format(",.0f")(d.revenue)}`);

    const xAxis = d3.axisBottom(x);
    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .attr("x", -5)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("fill", "#555");

    const yAxis = d3.axisLeft(y)
        .ticks(8)
        .tickFormat(d => `$${d3.format(",.0f")(d)}`);

    g.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .selectAll("text")
        .attr("font-size", "12px")
        .attr("fill", "#555");

    g.append("text")
        .attr("x", width / 2)
        .attr("y", height + 70)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .text("Month (2023)");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#333")
        .text("Revenue (USD)");

}).catch((error) => {
    console.log(error);
});