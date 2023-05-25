import { initMap } from "./map";
import { select, selectAll } from "d3-selection";

export const TIME_QUAKES_MAP_ID = "map1";

export const initTimeEarthQuakeMap = (mapId) => {
    let map = initMap(mapId);

    var svgLayer = new L.SVG({pane:"markerPane"});
    svgLayer.addTo(map);

    return map;
}

export const addDataToTimeMap = (map, data) => {
    console.log('bind data time map', map)
    var svg = select(map.getPanes().markerPane).select("svg");
    
    const yearSlider = document.getElementById("myRange");
    const year = document.getElementById("year");
    year.innerText = yearSlider.value;
    
    filterDataByYear(map, svg, data, yearSlider.value);

    yearSlider.oninput = () => {
        year.innerText = yearSlider.value;
    }

    yearSlider.onchange = () => {
        svg.selectAll("circle").remove();
        filterDataByYear(map, svg, data, yearSlider.value);
    };
}

const initD3MapLayer = (map, svgLayer, earthquakes) => {
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
    svgLayer.selectAll("circle")
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
    function update(svg) {
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
   
    // If the user change the map (zoom or drag), I update circle position:
    map.on("moveend", () => update(svgLayer));
};

export const filterDataByYear = (map, svgLayer, data, year) => {
    let latLongs = data
        .filter((d) => new Date(d.Date).getFullYear() === parseInt(year))
        .map((record) => {
          return {
            lat: parseFloat(record.Latitude),
            long: parseFloat(record.Longitude),
            mag: parseFloat(record.Magnitude),
          };
        });
    initD3MapLayer(map, svgLayer, latLongs);
}