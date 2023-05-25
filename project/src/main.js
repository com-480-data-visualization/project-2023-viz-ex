import L from "leaflet";
import { csv, json } from "d3";
import { initLegend, filterDataPerCountry } from "./legend";
import { initTimeEarthQuakeMap, addDataToTimeMap } from "./map/time-map";
 
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
 
const initChoroplethMap = (map, layerGroup, onCountryClick) => {
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
          console.log(feature.properties)
          onCountryClick(feature.properties);
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
    const isVisible = checkBox.checked;
    if(isVisible) {
      layerGroup.addLayer(choroplethMapSource);
      return;
    }
    layerGroup.removeLayer(choroplethMapSource);
  }
}

whenDocumentLoaded(() => {
  if (!window.isScriptLoaded) {
    // GeoJson Layer
    var layerGroup = new L.LayerGroup();

    let timeMap = initTimeEarthQuakeMap("map1")

    loadData((data) => {
      addDataToTimeMap(timeMap, data)
 
      // filterDataByYear(map, svg, data, yearSlider.value);
      let legendHandler = initLegend(map)

      // Choropleth map
      let choroplethSource = initChoroplethMap(map, layerGroup, (props) => {
        console.log('props', props)
        let country = props.ADMIN
        let countryData = filterDataPerCountry(country, data)
        legendHandler.open(countryData, country)
      });
      addChoroplethMap(map, layerGroup, choroplethSource);
    });
    window.isScriptLoaded = true;
  }
});
