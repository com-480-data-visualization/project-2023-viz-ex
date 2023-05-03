import L from 'leaflet'
import { select } from 'd3-selection'
import { 
    scaleLinear,
    extent,
    axisBottom,
    axisLeft,
    curveBasis,
    line,
} from 'd3';

const QUAKES_BY_COUNTRY_ID = 'contryQuakeViz'

const margin = {top: 3, right: 10, bottom: 10, left: 20},
    width = 360 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;



const displayData = (data) => {
    let svg = select(`#${QUAKES_BY_COUNTRY_ID}`)
            .append('svg')
                .attr('width', width)
                .attr('height', height)
            .append("g")
                .attr("transform",
                  `translate(${margin.left},${margin.top})`);

    console.log('display data')
    let x = scaleLinear()
        .domain(extent(data, function(d) { return d.x; }))
        .range([ 0, width ]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(axisBottom(x));

    let y = scaleLinear()
        .domain( [0, 11])
        .range([ height, 0 ]);
    svg.append("g")
        .call(axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", line()
            .curve(curveBasis) // Just add that to have a curve instead of segments
            .x(function(d) { return x(d.x) })
            .y(function(d) { return y(d.y) })
        )
    
    svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "myCircle")
          .attr("cx", function(d) { return x(d.x) } )
          .attr("cy", function(d) { return y(d.y) } )
          .attr("r", 8)
          .attr("stroke", "#69b3a2")
          .attr("stroke-width", 3)
          .attr("fill", "white")
}

export class LegendDataHandler {
    isOpen = false
    constructor(map) {
        this.map = map
        this.legend = L.control({ position: 'bottomright' })
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



const getLegendContent = () => {
    return `
        <div id="${QUAKES_BY_COUNTRY_ID}" style="height:400px; width:400px"></div>
    `
}
