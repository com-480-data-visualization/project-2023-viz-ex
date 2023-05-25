import { initMap } from "./map";
import { initLegend, filterDataPerCountry } from "../legend";
import { json } from "d3";

export const COUNTRY_EARTHQUAKES_MAP_ID = "country-map"

export const initCountryEarthQuakeMap = (mapId) => {
    let map = initMap(mapId);
    return map;
}

export const addDataToCountryMap = (map, data) => {
    let legendHandler = initLegend(map);
    let layerGroup = new L.LayerGroup();
    let choroplethSource = initChoroplethMap(map, layerGroup, (props) => {
        let country = props.ADMIN;
        let countryData = filterDataPerCountry(country, data);
        legendHandler.open(countryData, country);
    });
    addChoroplethMap(map, layerGroup, choroplethSource);
}

// Choropleth feature
const style = (feature) => {
    // TODO change scale
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
    layerGroup.addLayer(choroplethMapSource);
}
