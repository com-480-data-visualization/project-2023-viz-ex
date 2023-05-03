import L, { bounds } from 'leaflet'
import { select, selectAll } from 'd3-selection'
import { csv, hierarchy } from 'd3'
import { initLegend } from './legend'

const initMap = () => {
    let map = L
	    .map('mapid')
	    .setView([40.737, -73.923], 2)   // center position + zoom
        .setMaxBounds([[-90,-180], [90,180]]) // set max bounds to entire map
    
	// Add a tile to the map = a background. Comes from OpenStreetmap
	L.tileLayer(
		'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
		maxZoom: 10,
	}).addTo(map);
	
	// Add a svg layer to the map
	L.svg().addTo(map);
    return map;
}

const initD3MapLayer = (map, earthquakes) => {
    // Select the svg area and add circles:
    let maxZoom = map.getMaxZoom()
    let minRadius = (zoom) => {
        return 2
    }
    let maxRadius = (zoom) => {
        return 64 * (zoom / maxZoom) + minRadius(zoom)
    }

    function updateRadius(height, d) {
        let max = maxRadius(height)
        let min = minRadius(height)
        return (d.mag - 5.5)/(10 - 5.5) * (max - min) + min
    }

    select("#mapid")
        .select("svg")
        .selectAll("myCircles")
        .data(earthquakes)
        .enter()
        .append("circle")
            .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
            .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
            .attr("r", function(d) { return updateRadius(map.getZoom(), d) })
            .style("fill", "steelblue")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
      
    // Function that update circle position if something change
    function update() {
        select("#mapid")
            .select("svg")
            .selectAll("circle")
                .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
                .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
                .attr("r", function(d) { return updateRadius(map.getZoom(), d) })
    }
    
    // If the user change the map (zoom or drag), I update circle position:
    map.on("moveend", update)
}

const loadData = (afterLoadCallback) => {
    csv("/data/database.csv").then(data => {
        console.log("Data Loaded")
        afterLoadCallback(data)
    })
}

const bindButtonOnClickEvents = (legendHandler, rawData) => {
    var countryData = null
    document.getElementById("country-bouton").onclick = () => {
        let countryNameInput = document.getElementById('country')
        let countryName = countryNameInput.value

        let countryDataPerYear = rawData
            .filter(data => data.Country == countryName)
            .reduce((rv, x) => {
                let year = new Date(x.Date).getFullYear()
                console.log(rv)
                let yearData = rv[year] ?? [];
                yearData.push(x)
                rv[year] = yearData
                return rv;
            }, {})
            
        countryData = Object.entries(countryDataPerYear)
            .map(([ year, records]) => {
                return {
                    year: year,
                    nbQuakes: records.length
                }
            })
        console.log('data', countryData)
        legendHandler.openOrUpdate(countryData)
    }

    document.getElementById("close-legend").onclick = () => {
        if (!countryData) {
            return
        }
        legendHandler.close()
    }

    document.getElementById("open-legend").onclick = () => {
        legendHandler.open(countryData)
    }
}

const whenDocumentLoaded = (action) => {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

whenDocumentLoaded(() => {
    if (!window.isScriptLoaded) {
        console.log('load map')
        let map = initMap()

        loadData((data) => {
            let latLongs = data.map((record) => {
                return { 
                    lat: parseFloat(record.Latitude),
                    long: parseFloat(record.Longitude),
                    mag: parseFloat(record.Magnitude)
                }
            })
            initD3MapLayer(map, latLongs)
            let legendHandler = initLegend(map)
            bindButtonOnClickEvents(legendHandler, data)
        })

        window.isScriptLoaded = true;
    }
});
