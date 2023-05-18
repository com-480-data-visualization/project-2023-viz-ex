import L from 'leaflet'
import { select } from 'd3-selection'
import { 
    scaleLinear,
    scaleTime,
    extent,
    axisBottom,
    axisLeft,
    curveBasis,
    line,
    timeParse,
} from 'd3';
import { MAX_YEAR, MIN_YEAR } from './constants';

const QUAKES_BY_COUNTRY_ID = 'contryQuakeViz'

const margin = {top: 3, right: 10, bottom: 10, left: 20},
    width = 360 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;


const displayData = (yearRecords) => {
    let svg = select(`#${QUAKES_BY_COUNTRY_ID}`)
            .append('svg')
                .attr('width', 380)
                .attr('height', 320)
            .append("g")
                .attr("transform",
                  `translate(${margin.left},${margin.top})`);

    let data = yearRecords.map(({ year, nbQuakes }) => { 
            return { year: new Date(year, 0), nbQuakes: nbQuakes }
        })

    let x = scaleTime()
        .domain(extent(data, d => d.year))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(axisBottom(x));

    let y = scaleLinear()
        .domain(extent(data, d => d.nbQuakes))
        .range([ height, 0 ]);
    svg.append("g")
        .call(axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(d.nbQuakes) })
        )
    
    svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "myCircle")
          .attr("cx", function(d) { return x(d.year) } )
          .attr("cy", function(d) { return y(d.nbQuakes) } )
          .attr("r", 1.5)
          .attr("stroke", "steelblue")
          .attr("stroke-width", 3)
          .attr("fill", "steelblue")
}

export class LegendDataHandler {
    isOpen = false
    constructor(map) {
        this.map = map
        this.legend = L.control({ position: 'topright' })
        this.legend.onAdd = function() {
            this._div = L.DomUtil.create('div', 'info');
            this._div.id = 'country_info_1'
            this._div.innerHTML = getLegendContent()
            return this._div
        }
    }

    openOrUpdate(data) {
        if (this.isOpen) {
            this.update(data)
            return
        }
        this.open(data)
    }

    update(data) {
        displayData(data)
    }

    open(data) {
        this.legend.addTo(this.map)
        this.update(data)
        this.isOpen = true
    }

    close() {
        let countryInfoDiv = document.getElementById('country_info_1')
        countryInfoDiv?.remove()
        this.isOpen = false
    }
}

export const initLegend = (map) => {
    console.log('POPUP')

    let mockData = [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 5 },
        { x: 4, y: 10 },
        { x: 5, y: 7 },
        { x: 6, y: 1 },
    ]

    let legendHandler = new LegendDataHandler(map)

    // let legend = L.control({ position: 'bottomright' })

    // legend.update = function() {
    //     console.log('update')
    //     displayData(mockData)
    // }

    // legend.onAdd = function(map) {
    //     this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    //     this._div.innerHTML = getLegendContent()
    //     return this._div;
    // }

    // legend.addTo(map)
    // legend.update()
    return legendHandler
}

export const filterDataPerCountry = (country, rawData) => {
    let countryDataPerYear = rawData
        .filter(data => data.Country == country)
        .reduce((rv, x) => {
            let year = new Date(x.Date).getFullYear()
            let yearData = rv[year] ?? [];
            yearData.push(x)
            rv[year] = yearData
            return rv;
        }, {})
    let countryData = [...Array(MAX_YEAR - MIN_YEAR + 1).keys()]
        .map((yearDelta) => {
            let year = MIN_YEAR + yearDelta
            let records = countryDataPerYear[year] ?? []
            return {
                year: year,
                nbQuakes: records.length
            }
        })
    return countryData
}

const getLegendContent = () => {
    return `
        <div id="${QUAKES_BY_COUNTRY_ID}" style="height: 100%; width:100%"></div>
    `
}
