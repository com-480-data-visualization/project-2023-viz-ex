import L, { bounds, geoJSON } from 'leaflet'
import { select, selectAll } from 'd3-selection'
import { csv, hierarchy, json } from 'd3'

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
    var svgOverlayElement = select("#mapid")
        .append("svg")
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
        selectAll("circle")
            .attr("cx", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).x })
            .attr("cy", function(d){ return map.latLngToLayerPoint([d.lat, d.long]).y })
            .attr("r", function(d) { return updateRadius(map.getZoom(), d) })
    }
    
    // If the user change the map (zoom or drag), I update circle position:
    map.on("moveend", update)
    return svgOverlayElement
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

// Choropleth feature
const style = (feature)=> {
    function getColor(d) {
        d = d[0] // TODO: Change for propriety in dataset
        return d > "W" ? '#5C415D' :
               d > "T"  ? '#e575bc' :
               d > "P"  ? '#8bf9b9' :
               d > "L"  ? '#76f5fc' :
               d > "H"   ? '#f77059' :
               d > "E"   ? '#FEB24C' :
               d > "A"   ? '#64db57' :
                          '#b076fc';
    }
    return {
        fillColor: getColor(feature.properties.ADMIN),
        weight: 2,
        opacity: 1,
        color: '#4f4f4f',
        dashArray: '2',
        fillOpacity: 0.9
    };
}

    
const zoomOnCountry = (map) => {
    return (event) => {
        map.fitBounds(event.target.getBounds());
    }
}

const reset = (geojson) => {
    return (event)=> {
        geojson.resetStyle(event.target);
    }
}

const highlightFeature = (layer) =>{
    layer.setStyle({
        weight: 3,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
}



const applyChoroplethMap = (map) => {
    json('/data/countries.geojson')
    .then(function(data) {
        var geojsonLayer = L.geoJson(data, {
            style : style,
            onEachFeature: function (feature, layer) {
                layer.on('mouseover', function (e) {
                    highlightFeature(layer)
                });
                layer.on('mouseout', function () {
                    geojsonLayer.resetStyle(layer);
                });
                layer.on('click', function (e) {
                    map.fitBounds(e.target.getBounds());
                })
            }
        }).addTo(map);
    })
}



whenDocumentLoaded(() => {
    if (!window.isScriptLoaded) {
        let map = initMap()
        applyChoroplethMap(map)
        loadData((data) => {
            let latLongs = data.map((record) => {
                return { 
                    lat: parseFloat(record.Latitude),
                    long: parseFloat(record.Longitude),
                    mag: parseFloat(record.Magnitude)
                }
            })
            // Add a svg layer to the map
	        L.svg().addTo(map);
            let svgOverlayElement = initD3MapLayer(map, latLongs)
        })
        window.isScriptLoaded = true;
    }
});
