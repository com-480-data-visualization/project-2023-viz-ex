import { svg } from "d3";
import { initMap } from "./map";
import { select } from "d3-selection";
import DataDrivenRangeSlider from "data-driven-range-slider";

export const TIME_QUAKES_MAP_ID = "time-map";

export const initTimeEarthQuakeMap = (mapId) => {
    let map = initMap(mapId);

    var svgLayer = new L.SVG({pane:"markerPane"});
    svgLayer.addTo(map);

    return map;
}

export const addDataToTimeMap = (map, data) => {
    console.log('bind data time map', map)
    
    var svg = select(map.getPanes().markerPane).select("svg");
    initSlider(data, (data) => {
        // svg.selectAll("circle").remove();
        displayData(map, svg, data)
    });
    // const yearSlider = document.getElementById("myRange");
    // const year = document.getElementById("year");
    // year.innerText = yearSlider.value;
    
    // filterDataByYear(map, svg, data, 1995);

    // yearSlider.oninput = () => {
    //     year.innerText = yearSlider.value;
    // }

    // yearSlider.onchange = () => {
    //     svg.selectAll("circle").remove();
    //     filterDataByYear(map, svg, data, yearSlider.value);
    // };
}

const initSlider = (data, onSliderChange) => {
    let sliderContainer = document.getElementById('rangeSlider')
    let rangeSlider = new DataDrivenRangeSlider();
    rangeSlider
        .container(sliderContainer)
        .data(data)
        .accessor(d => new Date(d.Date))
        .onBrush(d => {
            console.log('on brush')
            onSliderChange(d.data)
        })
        .svgWidth(800)
        .svgHeight(100)
        .render()
    return rangeSlider;
}

var isD3LayerInit = false;

const initD3MapLayer = (map, svgLayer, earthquakes) => {
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
    let circles = svgLayer.selectAll("circle")
        .data(earthquakes);
    
    circles
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
        .attr("fill-opacity", 0.4)
        .style("pointer-events","visible")
        .on("click",(d) => {
            openPopup(d, map)
            L.DomEvent.stopPropagation(d);
        })

    circles.exit().remove()

    // Function that update circle position if something change
    function update(svg) {
        console.log("update")
        svg.selectAll("circle")
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
    if (!isD3LayerInit) {
        // If the user change the map (zoom or drag), I update circle position:
        map.on("moveend", () => {
            update(svgLayer)
        });
    }
    isD3LayerInit = true;
};

export const displayData = (map, svgLayer, data) => {
    let latLongs = data
        .map((record) => {
          return {
            lat: parseFloat(record.Latitude),
            long: parseFloat(record.Longitude),
            mag: parseFloat(record.Magnitude),
            country: record.Country,
            date: record.Date,
            depth: parseFloat(record.Depth)
          };
        });
    initD3MapLayer(map, svgLayer, latLongs);
}

export const filterDataByYear = (map, svgLayer, data, year) => {
    let latLongs = data
        .filter((d) => new Date(d.Date).getFullYear() === parseInt(year))
        .map((record) => {
          return {
            lat: parseFloat(record.Latitude),
            long: parseFloat(record.Longitude),
            mag: parseFloat(record.Magnitude),
            country: record.Country,
            date: record.Date,
            depth: parseFloat(record.Depth)
          };
        });
    initD3MapLayer(map, svgLayer, latLongs);
}

const openPopup = function(d, map) {
    // console.log(d)
    var elem = d
    var icon = L.divIcon({className: 'my-div-icon'}); // TODO: change style
    let tooltipMarker = new L.Marker([elem.lat, elem.long],{icon:icon});
    map.addLayer(tooltipMarker);
    var popup = L.popup()
        .setContent(getPopupContent(elem.country, elem.mag, elem.date));

    tooltipMarker.bindPopup(popup);
    tooltipMarker.openPopup();
}

const getPopupContent = (country, magnitude, date) => {
  return `
      <div class="legend">
          <h1>${country}</h1>
          <h3>Magnitude of ${magnitude}</h3>
          <h3>${date}</h3>
      </div>
  `
}