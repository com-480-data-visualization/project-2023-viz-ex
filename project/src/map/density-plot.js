import * as d3 from "d3";

const marginRatio = {top: 0.1, right: 0.1, bottom: 0.1, left: 0.1};

const getMargin = (marginRatio) => {
    const margin = {}
    const verticals = [ 'top', 'bottom' ]
    const isVertical = (key) => {
        return verticals.includes(key);
    }
    let elem = document.getElementById('density-plot')
    let width = elem.offsetWidth;
    let height = elem.offsetHeight;

    for (const key of Object.keys(marginRatio)) {
        const length = isVertical(key) ? height : width;
        margin[key] = length * marginRatio[key]
    }
    return margin;
}
const margin = getMargin(marginRatio);

const getSize = (marginRatio) => {
    let elem = document.getElementById('density-plot')
    let width = elem.offsetWidth * (1 - marginRatio.left - marginRatio.right);
    let height = elem.offsetHeight * (1 - marginRatio.top - marginRatio.bottom);
    return {
        width: width,
        height: height,
    }
}

const { width, height } = getSize(marginRatio);

export const initDensity = ()=> {
    initSlider(10);
    d3.json("./data/earthquake_magnitudes.json").then(function(_data) {
        // Get the different categories and count them
        const data = _data;
        
        const yearSlider = document.querySelector("input");
        const countriesToDisplay = new Set(getCountriesToDisplay(data))
        let yearData = data[yearSlider.value];

        let filteredYearData = filterData(yearData, countriesToDisplay)

        let svg = d3.select("#density-plot")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    `translate(${margin.left}, ${margin.top})`);

        initDensityPlot(filteredYearData, svg);

        yearSlider.oninput = () => {
                let yearData = data[yearSlider.value];
                let filteredYearData = filterData(yearData, countriesToDisplay)
                updateDensityPlot(filteredYearData, svg);
            }
    });
}

const initSlider = (nTicks) => {
    const minYear = 1965;
    const maxYear = 2016;
    const interval = Math.floor((maxYear - minYear)/nTicks)
    const datalist = document.getElementById("years");
    for (let tick = minYear; tick <= maxYear; tick += interval) {
        const option = document.createElement('option');
        option.label = tick;
        option.value = tick;
        datalist.append(option);
    }
}

const getCountriesToDisplay = (data) => {
    const earthquakeCount = new Map();
    for (const year of Object.keys(data)) {
        const earthquakeCountries = data[year];
        for (const country of Object.keys(earthquakeCountries)) {
            const count = earthquakeCount.get(country) ?? 0;
            const newCount = count + earthquakeCountries[country].length
            earthquakeCount.set(country, newCount)
        }
    }
    const sortedCountries = [...earthquakeCount.entries()].sort((a, b) => b[1] - a[1]);
    return sortedCountries
        .slice(0, 40)
        .map(([country, count]) => country);
}

const filterData = (yearData, countries) => {
    let filteredYearData = {};
    for (const country of countries) {
        if (countries.has(country)) {
            filteredYearData[country] = yearData[country];
        }
    }
    return filteredYearData;
}

const initDensityPlot = (data, svg) => {
    let categories = Object.keys(data);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Create the Y axis for names
    let yName = d3.scaleBand()
        .domain(categories)
        .range([0, height])
        .paddingInner(1)

    svg.append("g")
        .call(d3.axisLeft(yName));

    let allDensity = getDensities(data, categories)
    let areas = svg.selectAll("areas").data(allDensity)
    areas
        .enter()
        .append("path")
        .attr("transform", function(d){
            return(`translate(0, ${(getYName(d.key, categories)-height)})`)
        })
        .datum(function(d){ return(d.density) })
        .attr("class", "ridge")
        .attr("fill", "#69b3a2")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        );
}

const updateDensityPlot = (data, svg) => {
    var categories = Object.keys(data)
    let allDensity = getDensities(data, categories)

    let areas = svg.selectAll(".ridge")
    areas
        .data(allDensity)
        .merge(areas)
        .attr("transform", function(d){
            return(`translate(0, ${(getYName(d.key, categories)-height)})`)
        })
        .datum(function(d){ return(d.density) })
        .transition()
        .duration(1000)
        .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        );
}

// Add X axis
const x = d3.scaleLinear()
    .domain([4.5, 9.5])
    .range([ 0, width ]);

// Create a Y scale for densities
const y = d3.scaleLinear()
    .domain([0, 15])
    .range([ height, 0]);

const kde = kernelDensityEstimator(kernelEpanechnikov(0.5), x.ticks(20)) // increase this 40 for more accurate density.

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
    };
}

function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}

function getDensities(filterData, categories) {
    // Compute kernel density estimation for each column:
    const allDensity = []
    for (const category of categories) {
        let density = kde(filterData[category])
        allDensity.push({ key: category, density: density })
    }
    return allDensity;
}

const getYName = (key, categories) => {
    return d3.scaleBand()
        .domain(categories)
        .range([0, height])
        .paddingInner(1)(key)
}
