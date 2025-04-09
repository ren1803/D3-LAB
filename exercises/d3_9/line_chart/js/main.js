// Configuración y márgenes
const margin = { left: 80, right: 100, top: 60, bottom: 60 };
const height = 500 - margin.top - margin.bottom;
const width = 800 - margin.left - margin.right;

// Crear SVG con estilo oscuro
const svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "#222")
    .style("border-radius", "8px");

// Crear grupo principal
const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Funciones auxiliares
const parseTime = d3.timeParse("%Y");
const bisectDate = d3.bisector(d => d.year).left;

// Escalas
const x = d3.scaleTime().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Generadores de ejes con estilo claro
const xAxisCall = d3.axisBottom()
    .tickFormat(d3.timeFormat("%Y"))
    .tickSize(0);

const yAxisCall = d3.axisLeft()
    .ticks(5)
    .tickSize(0)
    .tickFormat(d => `${Math.round(d / 1000)}k`);

// Grupos de ejes
const xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height})`);

const yAxis = g.append("g")
    .attr("class", "y axis");

// Etiqueta del eje Y
yAxis.append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", -55)
    .attr("x", -height / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#aaa")
    .text("Population");

// Generador de línea con curva suave
const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .curve(d3.curveMonotoneX);

// Cargar y procesar datos
d3.json("data/example.json").then(data => {
    // Limpiar datos
    data.forEach(d => {
        d.year = parseTime(d.year);
        d.value = +d.value;
    });

    // Calcular dominios de escalas
    // Ajustar dominio Y para mostrar mejor la variación
    const yMinValue = d3.min(data, d => d.value) * 0.995;
    const yMaxValue = d3.max(data, d => d.value) * 1.005;

    x.domain(d3.extent(data, d => d.year));
    y.domain([yMinValue, yMaxValue]);

    // Líneas de cuadrícula horizontales sutiles
    g.selectAll("line.horizontalGrid")
        .data(y.ticks(5))
        .enter()
        .append("line")
        .attr("class", "horizontalGrid")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => y(d))
        .attr("y2", d => y(d))
        .attr("stroke", "#444")
        .attr("stroke-dasharray", "1,3");

    // Generar ejes con estilo claro
    xAxis.call(xAxisCall.scale(x))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#aaa");

    xAxis.selectAll("path")
        .style("stroke", "#555");

    yAxis.call(yAxisCall.scale(y))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#aaa");

    yAxis.selectAll("path")
        .style("stroke", "#555");

    // Añadir línea con animación
    const path = g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("d", line);

    // Animar la línea
    const pathLength = path.node().getTotalLength();
    path.attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0);

    // Tooltip mejorado
    const focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    // Líneas de guía para el tooltip
    focus.append("line")
        .attr("class", "x-hover-line")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "#777")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");

    // Círculo para el tooltip
    focus.append("circle")
        .attr("r", 7)
        .attr("fill", "white")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 2);

    // Texto del tooltip
    const tooltipText = focus.append("text")
        .attr("x", 15)
        .attr("y", -15)
        .attr("text-anchor", "start")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "white");

    // Área interactiva
    g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", 0)
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => focus.style("display", "none"))
        .on("mousemove", mousemove);

    // Función para el movimiento del mouse
    function mousemove() {
        const x0 = x.invert(d3.mouse(this)[0]);
        const i = bisectDate(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0 - d0.year > d1.year - x0 ? d1 : d0;

        // Actualizar tooltip
        focus.attr("transform", `translate(${x(d.year)}, ${y(d.value)})`);
        tooltipText.text(`${d.value.toLocaleString()}`);

        // Actualizar línea de guía vertical
        focus.select(".x-hover-line")
            .attr("y2", height - y(d.value));
    }
});