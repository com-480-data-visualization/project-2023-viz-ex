import L, { bounds, geoJSON } from "leaflet";
import { select, selectAll } from "d3-selection";
import { csv, filter, hierarchy, json } from "d3";
 
const initMap = () => {
  let map = L.map("mapid")
    .setView([40.737, -73.923], 2) // center position + zoom
    .setMaxBounds([
      [-90, -180],
      [90, 180],
    ]); // set max bounds to entire map
 
  // Add a tile to the map = a background. Comes from OpenStreetmap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 10,
  }).addTo(map);
  return map;
};
 
const initD3MapLayer = (map, earthquakes) => {
  // Select the svg area and add circles:
  let maxZoom = map.getMaxZoom();
  let minRadius = (zoom) => {
    return 2;
  };
  let maxRadius = (zoom) => {
    return 64 * (zoom / maxZoom) + minRadius(zoom);
  };
 
  function updateRadius(height, d) {
    let max = maxRadius(height);
    let min = minRadius(height);
    return ((d.mag - 5.5) / (10 - 5.5)) * (max - min) + min;
  }
  var svgOverlayElement = select("#mapid")
    .select("svg")
    .selectAll("myCircles")
    .data(earthquakes)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return map.latLngToLayerPoint([d.lat, d.long]).x;
    })
    .attr("cy", function (d) {
      return map.latLngToLayerPoint([d.lat, d.long]).y;
    })
    .attr("r", function (d) {
      return updateRadius(map.getZoom(), d);
    })
    .style("fill", "steelblue")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 3)
    .attr("fill-opacity", 0.4);
 
  // Function that update circle position if something change
  function update() {
    selectAll("circle")
      .attr("cx", function (d) {
        return map.latLngToLayerPoint([d.lat, d.long]).x;
      })
      .attr("cy", function (d) {
        return map.latLngToLayerPoint([d.lat, d.long]).y;
      })
      .attr("r", function (d) {
        return updateRadius(map.getZoom(), d);
      });
  }
 
  // If the user change the map (zoom or drag), I update circle position:
  map.on("moveend", update);
  return svgOverlayElement;
};
 
const loadData = (afterLoadCallback) => {
  csv("/data/database.csv").then((data) => {
    console.log("Data Loaded");
    afterLoadCallback(data);
  });
};
 
const whenDocumentLoaded = (action) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", action);
  } else {
    action();
  }
};
 
// Choropleth feature
const style = (feature) => {
  function getColor(d) {
    return d > 3000 ? "#5C415D" : 
          d > 2500 ? "#e575bc" :
          d > 2000 ? "#8bf9b9" : 
          d > 1500 ? "#76f5fc" : 
          d > 1000 ? "#f77059" :
          d > 500 ? "#FEB24C" :
          d > 100 ? "#64db57" :
          "#b076fc";
  }
  return {
    fillColor: getColor(feature.properties.Total),
    weight: 2,
    opacity: 1,
    color: "#4f4f4f",
    dashArray: "2",
    fillOpacity: 0.9,
  };
};
 
const highlightFeature = (layer) => {
  layer.setStyle({
    weight: 3,
    color: "white",
    dashArray: "",
    fillOpacity: 0.7,
  });
  layer.bringToFront();
};
 
const initChoroplethMap = (map, layerGroup) => {
  json("/data/countries.geojson").then(function (data) {
    var geojsonLayer = new L.GeoJSON(data, {
      style: style,
      onEachFeature: function (feature, layer) {
        layer.on("mouseover", function (e) {
          highlightFeature(layer);
        });
        layer.on("mouseout", function () {
          geojsonLayer.resetStyle(layer);
        });
        layer.on("click", function (e) {
          console.log(feature.properties.Total)
          map.fitBounds(e.target.getBounds());
        });
      },
    });
    layerGroup.addLayer(geojsonLayer);
  });
};

const addChoroplethMap = (layerGroup, choroplethMapSource)=>{
  const checkBox = document.querySelector("#showCountries")
  checkBox.oninput = () => {
    const isVisible = checkBox.checked
    console.log(isVisible)
    if(!isVisible) {
      console.log("removing")
      layerGroup.removeLayer(choroplethMapSource)
      return;
    }
    console.log("Adding")
    layerGroup.addLayer(choroplethMapSource)
  }
}
 
const filterDataByYear = (map, data, year) => {
    let latLongs = data
      .filter((d) => new Date(d.Date).getFullYear() === parseInt(year))
      .map((record) => {
        return {
          lat: parseFloat(record.Latitude),
          long: parseFloat(record.Longitude),
          mag: parseFloat(record.Magnitude),
        };
      });
    L.svg().addTo(map);
    initD3MapLayer(map, latLongs);
}
 
whenDocumentLoaded(() => {
  if (!window.isScriptLoaded) {
    let map = initMap();
    var layerGroup = new L.LayerGroup();
    let choroplethSource = initChoroplethMap(map, layerGroup)
    addChoroplethMap(map, layerGroup, choroplethSource)

    loadData((data) => {
      const yearSlider = document.getElementById("myRange");
      const year = document.getElementById("year")
      year.innerText = yearSlider.value
 
      filterDataByYear(map, data, yearSlider.value)
 
      yearSlider.oninput = () => {
        year.innerText = yearSlider.value
      }
 
      yearSlider.onchange = () => {
        map = map.remove()
        map = initMap()
        filterDataByYear(map, data, yearSlider.value)
      };
    });
    window.isScriptLoaded = true;
  }
});