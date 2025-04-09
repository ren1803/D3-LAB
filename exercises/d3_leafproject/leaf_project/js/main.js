d3.json("data/data.json").then(data => {
	const formattedData = data.map(year => ({
		year: year.year,
		countries: year.countries.filter(d => d.income && d.life_exp).map(d => ({
			...d,
			income: +d.income,
			life_exp: +d.life_exp,
			population: +d.population
		}))
	}));

	const margin = { top: 50, right: 200, bottom: 50, left: 100 };
	const width = 960 - margin.left - margin.right;
	const height = 500 - margin.top - margin.bottom;

	const svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("background", "#f9f9fa")
		.style("border-radius", "8px")
		.style("box-shadow", "0 4px 12px rgba(0,0,0,0.08)")
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	svg.append("text")
		.attr("x", width / 2)
		.attr("y", -20)
		.attr("text-anchor", "middle")
		.attr("font-size", "20px")
		.attr("font-weight", "bold")
		.attr("fill", "#333")
		.text("Income vs. Life Expectancy (1800-2014)");

	const xScale = d3.scaleLog()
		.domain([142, 150000])
		.range([0, width]);

	const yScale = d3.scaleLinear()
		.domain([0, 90])
		.range([height, 0]);

	const areaScale = d3.scaleLinear()
		.domain([2000, 1400000000])
		.range([25 * Math.PI, 1500 * Math.PI]);

	const colorScale = d3.scaleOrdinal()
		.range(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"]);


	svg.append("g")
		.attr("class", "grid")
		.attr("opacity", 0.1)
		.call(d3.axisLeft(yScale)
			.tickSize(-width)
			.tickFormat("")
		);

	const xAxis = d3.axisBottom(xScale)
		.tickValues([400, 4000, 40000])
		.tickFormat(d => `$${d}`);

	const yAxis = d3.axisLeft(yScale);

	svg.append("g")
		.attr("transform", `translate(0,${height})`)
		.call(xAxis)
		.selectAll("text")
		.style("font-size", "12px");

	svg.append("g")
		.call(yAxis)
		.selectAll("text")
		.style("font-size", "12px");

	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -50)
		.attr("text-anchor", "middle")
		.attr("font-weight", "bold")
		.attr("fill", "#555")
		.text("LIFE EXPECTANCY (YEARS)");

	svg.append("text")
		.attr("x", width / 2)
		.attr("y", height + 40)
		.attr("text-anchor", "middle")
		.attr("font-weight", "bold")
		.attr("fill", "#555")
		.text("GDP PER CAPITA ($)");

	const yearLabel = svg.append("text")
		.attr("x", width - 100)
		.attr("y", height - 10)
		.attr("font-size", "34px")
		.attr("font-weight", "bold")
		.attr("fill", "#555")
		.attr("opacity", 0.4);

	// Tooltip para mostrar información al pasar el ratón
	const tooltip = d3.select("body").append("div")
		.style("position", "absolute")
		.style("background", "rgba(255, 255, 255, 0.95)")
		.style("padding", "10px")
		.style("border-radius", "4px")
		.style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
		.style("pointer-events", "none")
		.style("opacity", 0)
		.style("transition", "opacity 0.2s");

	function update(yearData) {
		const filteredData = yearData.countries;

		const circles = svg.selectAll("circle").data(filteredData, d => d.country);

		// EXIT - Eliminar círculos con animación
		circles.exit()
			.transition()
			.duration(500)
			.attr("r", 0)
			.remove();

		// UPDATE - Actualizar círculos existentes
		circles
			.transition()
			.duration(750)
			.ease(d3.easeQuadInOut)
			.attr("cx", d => xScale(d.income))
			.attr("cy", d => yScale(d.life_exp))
			.attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI));

		// ENTER - Añadir nuevos círculos
		circles.enter()
			.append("circle")
			.attr("cx", d => xScale(d.income))
			.attr("cy", d => yScale(d.life_exp))
			.attr("r", 0)
			.attr("fill", d => colorScale(d.continent))
			.attr("stroke", "white")
			.attr("stroke-width", 1.5)
			.attr("opacity", 0.7)
			.on("mouseover", function (event, d) {
				// Mostrar tooltip
				tooltip.transition().duration(200).style("opacity", 0.95);
				tooltip.html(`
					<strong>${d.country}</strong><br>
					Continent: ${d.continent}<br>
					Population: ${d3.format(",")(d.population)}<br>
					Income: $${d3.format(",")(Math.round(d.income))}<br>
					Life Exp: ${d.life_exp.toFixed(1)} years
				`)
					.style("left", (event.pageX + 10) + "px")
					.style("top", (event.pageY - 28) + "px");

				// Resaltar círculo
				d3.select(this)
					.attr("stroke", "#333")
					.attr("stroke-width", 2)
					.attr("opacity", 1);
			})
			.on("mouseout", function () {
				// Ocultar tooltip
				tooltip.transition().duration(500).style("opacity", 0);
				// Restaurar círculo
				d3.select(this)
					.attr("stroke", "white")
					.attr("stroke-width", 1.5)
					.attr("opacity", 0.7);
			})
			.transition()
			.duration(750)
			.ease(d3.easeElastic)
			.attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI));

		yearLabel.text(yearData.year);
	}

	const conts = [...new Set(data.flatMap(year => year.countries.map(d => d.continent)))];

	// Leyenda mejorada
	const legend = svg.append("g")
		.attr("transform", `translate(${width + 20}, 50)`);

	// Título de la leyenda
	legend.append("text")
		.attr("x", 0)
		.attr("y", -10)
		.style("font-weight", "bold")
		.text("Continents");

	conts.forEach((continent, i) => {
		legend.append("rect")
			.attr("x", 0)
			.attr("y", i * 25)
			.attr("width", 18)
			.attr("height", 18)
			.attr("rx", 3)
			.attr("fill", colorScale(continent))
			.attr("stroke", "white")
			.attr("stroke-width", 1);

		legend.append("text")
			.attr("x", 30)
			.attr("y", i * 25 + 13)
			.text(continent)
			.attr("font-size", "13px")
			.style("text-transform", "capitalize")
			.attr("fill", "#555");
	});

	let yearIndex = 0;
	setInterval(() => {
		update(formattedData[yearIndex]);
		yearIndex = (yearIndex + 1) % formattedData.length;
	}, 1000);

}).catch(error => {
	console.error("Error loading data:", error);
});