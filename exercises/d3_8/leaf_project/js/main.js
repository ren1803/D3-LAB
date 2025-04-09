d3.json("data/data.json").then(function (data) {

	const formattedData = data.map(yearData => {
		return {
			year: +yearData.year,
			countries: yearData.countries
				.filter(country => country.income != null && country.life_exp != null)
				.map(country => ({
					country: String(country.country || ""),
					continent: String(country.continent || ""),
					income: Number(country.income),
					life_exp: Number(country.life_exp),
					population: Number(country.population || 0)
				}))
		};
	});

	let yearIndex = 0;
	let selectedContinent = "All";
	let playing = false;
	let interval;

	// Configuración de dimensiones y márgenes
	const margin = { top: 50, right: 200, bottom: 100, left: 100 };
	const width = 960 - margin.left - margin.right;
	const height = 500 - margin.top - margin.bottom;

	// Extraer lista de continentes únicos para el filtro
	const continents = ["All"];
	formattedData.forEach(year => {
		year.countries.forEach(country => {
			if (country.continent && !continents.includes(country.continent)) {
				continents.push(country.continent);
			}
		});
	});

	const container = d3.select("body")
		.append("div")
		.attr("class", "gapminder-container")
		.style("max-width", "1000px")
		.style("margin", "0 auto")
		.style("font-family", "'Segoe UI', Tahoma, sans-serif")
		.style("background-color", "#fff")
		.style("border-radius", "10px")
		.style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
		.style("padding", "20px");

	// Título principal
	container.append("h1")
		.text("Wealth & Health of Nations")
		.style("text-align", "center")
		.style("color", "#2c3e50")
		.style("margin-bottom", "30px");

	// Panel de controles
	const controls = container.append("div")
		.attr("class", "controls")
		.style("display", "flex")
		.style("align-items", "center")
		.style("gap", "15px")
		.style("background-color", "#f8f9fa")
		.style("padding", "15px")
		.style("border-radius", "8px")
		.style("margin-bottom", "20px");

	// Botón de reproducción estilizado
	const playButton = controls.append("button")
		.attr("id", "play-button")
		.text("Play")
		.style("background-color", "#3498db")
		.style("color", "white")
		.style("border", "none")
		.style("border-radius", "4px")
		.style("padding", "8px 15px")
		.style("cursor", "pointer")
		.style("font-weight", "500")
		.style("transition", "background-color 0.2s");

	// Botón de reinicio estilizado
	const resetButton = controls.append("button")
		.attr("id", "reset-button")
		.text("Reset")
		.style("background-color", "#7f8c8d")
		.style("color", "white")
		.style("border", "none")
		.style("border-radius", "4px")
		.style("padding", "8px 15px")
		.style("cursor", "pointer")
		.style("font-weight", "500")
		.style("transition", "background-color 0.2s");

	// Etiqueta del año actual
	const yearLabelUI = controls.append("div")
		.attr("id", "year-label")
		.text(`Year: ${formattedData[0].year}`)
		.style("font-weight", "bold")
		.style("color", "#2c3e50")
		.style("margin-left", "15px")
		.style("margin-right", "10px");

	// Slider para navegar por los años
	const sliderContainer = controls.append("div")
		.style("flex-grow", "1")
		.style("display", "flex")
		.style("flex-direction", "column")
		.style("gap", "5px");

	const yearRangeText = sliderContainer.append("div")
		.style("display", "flex")
		.style("justify-content", "space-between")
		.style("font-size", "12px")
		.style("color", "#7f8c8d");

	yearRangeText.append("span").text(formattedData[0].year);
	yearRangeText.append("span").text(formattedData[formattedData.length - 1].year);

	const slider = sliderContainer.append("input")
		.attr("type", "range")
		.attr("id", "year-slider")
		.attr("min", 0)
		.attr("max", formattedData.length - 1)
		.attr("value", 0)
		.style("width", "100%");

	// Selector de continente
	const filterContainer = controls.append("div")
		.style("margin-left", "auto");

	filterContainer.append("label")
		.attr("for", "continent-filter")
		.text("Continent: ")
		.style("font-size", "14px")
		.style("margin-right", "5px");

	filterContainer.append("select")
		.attr("id", "continent-filter")
		.style("padding", "6px")
		.style("border-radius", "4px")
		.style("border", "1px solid #ddd")
		.selectAll("option")
		.data(continents)
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => d);


	const svg = container.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("background-color", "#f8f9fa")
		.style("border-radius", "8px")
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);


	svg.append("g")
		.attr("class", "grid")
		.attr("opacity", 0.1)
		.call(d3.axisLeft(d3.scaleLinear().domain([0, 90]).range([height, 0]))
			.tickSize(-width)
			.tickFormat("")
		);

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
		.domain(continents.filter(d => d !== "All"))
		.range(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"]);

	const xAxis = d3.axisBottom(xScale)
		.tickValues([400, 4000, 40000])
		.tickFormat(d => `$${d}`);

	svg.append("g")
		.attr("transform", `translate(0,${height})`)
		.call(xAxis)
		.selectAll("text")
		.style("font-size", "12px");


	const yAxis = d3.axisLeft(yScale);

	svg.append("g")
		.call(yAxis)
		.selectAll("text")
		.style("font-size", "12px");


	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -60)
		.attr("text-anchor", "middle")
		.style("font-size", "14px")
		.style("font-weight", "bold")
		.style("fill", "#555")
		.text("LIFE EXPECTANCY (YEARS)");


	svg.append("text")
		.attr("x", width / 2)
		.attr("y", height + 50)
		.attr("text-anchor", "middle")
		.style("font-size", "14px")
		.style("font-weight", "bold")
		.style("fill", "#555")
		.text("GDP PER CAPITA ($)");


	const yearLabel = svg.append("text")
		.attr("x", width - 100)
		.attr("y", height - 20)
		.attr("font-size", "40px")
		.attr("fill", "#2c3e50")
		.attr("opacity", "0.3")
		.attr("font-weight", "bold")
		.attr("text-anchor", "end");


	const tooltip = container.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0)
		.style("position", "absolute")
		.style("background-color", "rgba(255, 255, 255, 0.95)")
		.style("border", "1px solid #ddd")
		.style("border-radius", "6px")
		.style("padding", "12px")
		.style("box-shadow", "0 3px 8px rgba(0,0,0,0.15)")
		.style("pointer-events", "none")
		.style("font-size", "14px")
		.style("line-height", "1.4")
		.style("transition", "opacity 0.2s");

	const legend = svg.append("g")
		.attr("transform", `translate(${width + 20}, 50)`);


	legend.append("text")
		.attr("x", 0)
		.attr("y", -15)
		.text("Continents")
		.style("font-weight", "bold")
		.style("font-size", "14px");

	continents.filter(d => d !== "All").forEach((continent, i) => {
		const legendRow = legend.append("g")
			.attr("transform", `translate(0, ${i * 25})`);

		legendRow.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 18)
			.attr("height", 18)
			.attr("rx", 3)
			.attr("fill", colorScale(continent))
			.attr("stroke", "white")
			.attr("stroke-width", 1);

		legendRow.append("text")
			.attr("x", 26)
			.attr("y", 13)
			.text(continent)
			.style("font-size", "13px")
			.style("fill", "#555");
	});


	function update(yearData) {

		let filteredData = yearData.countries;
		if (selectedContinent !== "All") {
			filteredData = filteredData.filter(d => d.continent === selectedContinent);
		}

		yearLabel.text(yearData.year);
		yearLabelUI.text(`Year: ${yearData.year}`);

		slider.property("value", yearIndex);


		const circles = svg.selectAll("circle")
			.data(filteredData, d => d.country);


		circles.exit()
			.transition()
			.duration(500)
			.attr("r", 0)
			.remove();


		circles
			.transition()
			.duration(750)
			.ease(d3.easeQuadInOut)
			.attr("cx", d => xScale(d.income))
			.attr("cy", d => yScale(d.life_exp))
			.attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI));

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

				const countryName = d.country || "Unknown";
				const continent = d.continent || "Unknown";
				const income = d.income ? `$${Math.round(d.income).toLocaleString()}` : "N/A";
				const lifeExp = d.life_exp ? `${d.life_exp.toFixed(1)} years` : "N/A";
				const population = d.population ? d.population.toLocaleString() : "N/A";

				tooltip.transition()
					.duration(200)
					.style("opacity", 0.95);

				tooltip.html(`
                    <div style="font-weight:bold;font-size:16px;margin-bottom:5px;color:#2c3e50">${countryName}</div>
                    <div><span style="font-weight:500">Continent:</span> ${continent}</div>
                    <div><span style="font-weight:500">GDP per capita:</span> ${income}</div>
                    <div><span style="font-weight:500">Life expectancy:</span> ${lifeExp}</div>
                    <div><span style="font-weight:500">Population:</span> ${population}</div>
                `)
					.style("left", `${event.pageX + 15}px`)
					.style("top", `${event.pageY - 28}px`);


				d3.select(this)
					.attr("stroke", "#333")
					.attr("stroke-width", 2)
					.attr("opacity", 1);
			})
			.on("mouseout", function () {
				tooltip.transition()
					.duration(500)
					.style("opacity", 0);


				d3.select(this)
					.attr("stroke", "white")
					.attr("stroke-width", 1.5)
					.attr("opacity", 0.7);
			})
			.transition()
			.duration(750)
			.ease(d3.easeElastic)
			.attr("r", d => Math.sqrt(areaScale(d.population) / Math.PI));
	}

	playButton.on("click", function () {
		if (playing) {
			clearInterval(interval);
			playButton.text("Play")
				.style("background-color", "#3498db");
		} else {
			interval = setInterval(() => {
				yearIndex = (yearIndex + 1) % formattedData.length;
				update(formattedData[yearIndex]);
			}, 1000);
			playButton.text("Pause")
				.style("background-color", "#e74c3c");
		}
		playing = !playing;
	});

	resetButton.on("click", function () {
		yearIndex = 0;
		update(formattedData[yearIndex]);

		if (playing) {
			clearInterval(interval);
			playing = false;
			playButton.text("Play")
				.style("background-color", "#3498db");
		}
	});


	slider.on("input", function () {
		yearIndex = +this.value;
		update(formattedData[yearIndex]);
	});


	d3.select("#continent-filter").on("change", function () {
		selectedContinent = this.value;
		update(formattedData[yearIndex]);
	});


	update(formattedData[0]);


	d3.selectAll("button")
		.on("mouseover", function () {
			d3.select(this).style("opacity", 0.9);
		})
		.on("mouseout", function () {
			d3.select(this).style("opacity", 1);
		});
});