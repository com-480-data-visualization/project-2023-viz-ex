import L, { bounds } from 'leaflet'
import { select, selectAll } from 'd3-selection'
import { csv } from 'd3'

const initMap = () => {
    let map = L
	    .map('mapid')
	    .setView([40.737, -73.923], 2)   // center position + zoom
        .setMaxBounds([[-90,-180], [90,180]]) // set max bounds to entire map
    
	// Add a tile to the map = a background. Comes from OpenStreetmap
	L.tileLayer(
		'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
		maxZoom: 5,
	}).addTo(map);
	
	// Add a svg layer to the map
	L.svg().addTo(map);
    return map;
}

const initD3MapLayer = (map, markers) => {
    // Select the svg area and add circles:
    select("#mapid")
        .select("svg")
        .selectAll("myCircles")
        .data(markers)
        .enter()
        .append("circle")
            .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
            .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
            .attr("r", 3)
            .style("fill", "red")
            .attr("stroke", "red")
            .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
      
    // Function that update circle position if something change
    function update() {
        selectAll("circle")
            .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
            .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
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

const whenDocumentLoaded = (action) => {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

whenDocumentLoaded(() => {
    if (!window.isScriptLoaded) {
        let map = initMap()
        loadData((data) => {
            let latLongs = data.map((record) => {
                return { 
                    lat: parseInt(record.Latitude),
                    long: parseInt(record.Longitude),
                }
            })
            initD3MapLayer(map, latLongs)
        })
        window.isScriptLoaded = true;
    }
});
