import L from 'leaflet'
import { select } from 'd3-selection'
import { 
    scaleLinear,
    scaleTime,
    extent,
    axisBottom,
    axisLeft,
} from 'd3';
import { MAX_YEAR, MIN_YEAR } from './constants';

const QUAKES_BY_COUNTRY_ID = 'contryQuakeViz'

const margin = {top: 10, right: 15, bottom: 35, left: 40 }

const displayData = (yearRecords) => {
    let width = 420 - margin.left - margin.right
    let height = 285 - margin.top - margin.bottom

    let svg = select(`#${QUAKES_BY_COUNTRY_ID}`)
            .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                  `translate(${margin.left},${margin.top})`);
                  

    let data = yearRecords.map(({ year, nbQuakes }) => { 
        return { year: new Date(year, 0), nbQuakes: nbQuakes }
    })
    
    let maxQuakesCount = Math.max(...data.map(({year, nbQuakes}) => nbQuakes), 1)

    let x = scaleTime()
        .domain(extent(data, d => d.year))
        .range([ 0, width ]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(axisBottom(x));

    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height + 32)
        .text("Year");

    let y = scaleLinear()
        .domain([0, maxQuakesCount])
        .range([ height, 0 ])

    let nTicks = Math.min(maxQuakesCount, 15)
    svg.append("g")
        .call(
            axisLeft(y).ticks(nTicks)
        );

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -40)
        .attr("x", -height/5)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Number of Earthquakes");
    
    svg.selectAll("mybar")
        .data(data)
        .enter()
        .append("rect")
          .attr("x", function(d) { return x(d.year); })
          .attr("y", function(d) { return y(d.nbQuakes); })
          .attr("width", 5)
          .attr("height", function(d) { return height - y(d.nbQuakes); })
          .attr("fill", "steelblue")
}

export class LegendDataHandler {
    constructor(map) {
        this.map = map
        this.legend = L.control({ position: 'topright' })
    }

    setLegend(country) {
        this.legend.onAdd = function() {
            this._div = L.DomUtil.create('div', 'info');
            this._div.id = 'country_info_1'
            this._div.innerHTML = getLegendContent(country)
            return this._div
        }
    }

    open(data, country) {
        this.close()
        this.setLegend(country)
        this.legend.addTo(this.map)
        displayData(data)
    }

    close() {
        let countryInfoDiv = document.getElementById('country_info_1')
        countryInfoDiv?.remove()
    }
}

export const initLegend = (map) => {
    return new LegendDataHandler(map)
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

const getLegendContent = (title) => {
    return `
        <div class="legend">
            <h1>${title}</h1>
            <div id="${QUAKES_BY_COUNTRY_ID}" style="height: 100%; width:100%"></div>
        </div>
    `
}
