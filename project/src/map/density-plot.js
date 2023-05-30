import * as d3 from "d3";

 // set the dimensions and margins of the graph
 const margin = {top: 60, right: 30, bottom: 20, left:110},
 width = 560 - margin.left - margin.right,
 height = 500 - margin.top - margin.bottom;

export const initDensity=()=> {
    d3.json("./data/earthquake_magnitudes.json").then(function(_data) {
        // Get the different categories and count them
    const data = _data;

    const yearSlider = document.querySelector("input");
    const year = document.getElementById("year")
    year.innerText = yearSlider.value


    var filterData = data[yearSlider.value];
    console.log(filterData)
    var categories = Object.keys(filterData);
    var allDensity;
    var yName;

    yearSlider.oninput = () => {
        year.innerText = yearSlider.value
    }
    
    // append the svg object to the body of the page
    const svg = d3.select("#density-plot")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            `translate(${margin.left}, ${margin.top})`);
    

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));

        // Create the Y axis for names
        yName = d3.scaleBand()
            .domain(categories)
            .range([0, height])
            .paddingInner(1)

        svg.append("g")
            .call(d3.axisLeft(yName));

        allDensity = getDensities(filterData, categories, kde, yearSlider.value)
        // updatePath(svg, allDensity, yName)
        let areas = svg.selectAll("areas").data(allDensity)
        areas.enter()
            .append("path")
            .attr("transform", function(d){
                return(`translate(0, ${(getYName(d.key, categories)-height)})`)
            })
            .datum(function(d){return(d.density)})
            .attr("fill", "#69b3a2")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .merge(areas)
            .attr("d",  d3.line()
                .curve(d3.curveBasis)
                .x(function(d) { return x(d[0]); })
                .y(function(d) { return y(d[1]); })
            )
        areas.exit().remove()

        yearSlider.onchange = () => {
            filterData = data[yearSlider.value];
            categories = Object.keys(filterData);
            allDensity = getDensities(filterData, categories, kde, yearSlider.value);
            updatePath(areas, allDensity, categories);
          }
    });        
}

// Add X axis
const x = d3.scaleLinear()
    .domain([4, 9.5])
    .range([ 0, width ]);

// Create a Y scale for densities
const y = d3.scaleLinear()
    .domain([0, 10])
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

function getDensities (filterData, categories) {
    // Compute kernel density estimation for each column:
    const allDensity = []
    const n = categories.length
    for (let i = 0; i < n; i++) {
        let key = categories[i]
        let density = kde(filterData[key])
        allDensity.push({key: key, density: density})
    }
    return allDensity;
}

const getYName = (key, categories) => {
    return d3.scaleBand()
        .domain(categories)
        .range([0, height])
        .paddingInner(1)(key)
}

function updatePath(areas, allDensity, categories) {
    console.log("CATEGORIES:", categories.length)
    areas.enter()
        .append("path")
        .attr("transform", function(d){return(`translate(0, ${(getYName(d.key, categories)-height)})`)})
        .datum(function(d){
            console.log(d.key)
            console.log(getYName(d.key, categories));
            return(d.density)
        })
        .attr("fill", "#69b3a2")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .merge(areas)
        .attr("d", d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        )
    areas.exit().remove()
}