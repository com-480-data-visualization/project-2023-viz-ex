import { initMap } from "./map";
import { initLegend, filterDataPerCountry } from "../legend";
import { json, scaleLinear, legendColor } from "d3";

export const COUNTRY_EARTHQUAKES_MAP_ID = "country-map"

export const initCountryEarthQuakeMap = (mapId) => {
    let map = initMap(mapId);
    return map;
}

export const addDataToCountryMap = (map, data) => {
    let legendHandler = initLegend(map);
    initMapLegend(map);
    let layerGroup = new L.LayerGroup();
    let choroplethSource = initChoroplethMap(
        map,
        layerGroup, 
        (props) => {
            let country = props.ADMIN;
            let countryData = filterDataPerCountry(country, data);
            legendHandler.open(countryData, country);
        },
        () => {
            legendHandler.close();
        },
    );
    addChoroplethMap(map, layerGroup, choroplethSource);
}

// Choropleth feature
const style = (feature) => {
    return {
      fillColor: getColor(feature.properties.Total),
      weight: 2,
      opacity: 1,
      color: "#313639",
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

const initChoroplethMap = (map, layerGroup, onCountryClick, onOutsideClick) => {
    json(`${document.baseURI}data/countries.geojson`).then(function (data) {
        var clickedFeature = undefined;
        
        var geojsonLayer = new L.GeoJSON(data, {
            style: style,
            onEachFeature: function (feature, layer) {
                layer.on("mouseover", function (e) {
                    highlightFeature(layer);
                });

                layer.on("mouseout", function () {
                    if (clickedFeature === layer) {
                        return;
                    }
                    geojsonLayer.resetStyle(layer);
                    if(clickedFeature !== undefined) {
                        clickedFeature.bringToFront();
                    }
                });

                layer.on("click", function (e) {
                    if (clickedFeature !== layer) {
                        geojsonLayer.resetStyle(clickedFeature);
                    }
                    onCountryClick(feature.properties);
                    
                    map.fitBounds(e.target.getBounds());
                    highlightFeature(layer);

                    clickedFeature = layer;
                    L.DomEvent.stopPropagation(e);
                });
            },
        });
        map.on("click", () => {
            if (!clickedFeature) {
                return;
            }
            
            geojsonLayer.resetStyle(clickedFeature);
            clickedFeature = undefined;
            onOutsideClick();
        })
        layerGroup.addLayer(geojsonLayer);
    });
};

const addChoroplethMap = (layerGroup, choroplethMapSource)=>{
    layerGroup.addLayer(choroplethMapSource);
}

const initMapLegend = (map)=> {
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        var labels = ['<strong>Total number of earthquakes recorded</strong>'];
        var categories = [1000, 500, 200, 100, 50, 20, 10, 0];

        for (var i = 0; i < categories.length; i++) {
                div.innerHTML += 
                labels.push(
                    '<div class=legendColor>'+
                    '<div id="circle" style="background:' + getColor(categories[i]) + '"></div>' 
                    +'<div id=color-legend-values>' + ' > ' + categories[i].toString() +
                    '</div></div>'
                );

            }
        div.innerHTML = labels.join('');
        return div;
    };
    legend.addTo(map);
}

const getColor = (d) => {
    return d >= 1000 ? '#6890b5' :
           d >= 500  ? '#4a5b78' :
           d >= 200  ? '#627ad5' :
           d >= 100  ? '#5e4dcd' :
           d >= 50   ? '#7a5d9b' :
           d >= 20   ? '#a93fd9' :
           d >= 10   ? '#2bc4d3' :
                      '#afb2b2';              
}