import { csv } from "d3";
import { initTimeEarthQuakeMap, addDataToTimeMap, TIME_QUAKES_MAP_ID } from "./map/time-map";
import { COUNTRY_EARTHQUAKES_MAP_ID, addDataToCountryMap, initCountryEarthQuakeMap } from "./map/country-map";
import { initWorld } from "./background-globe.js";
import { initRadialChart } from "./map/radial-chart";

const loadData = (afterLoadCallback) => {
  csv(`${document.baseURI}data/database.csv`).then((data) => {
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

whenDocumentLoaded(() => {
  if (!window.isScriptLoaded) {
    csv(`${document.baseURI}data/sfo-temperature.csv`).then((data) => {
      document.querySelector("#radial-chart").append(
      initRadialChart(data));
    })


    let globe = initWorld();
    let timeMap = initTimeEarthQuakeMap(TIME_QUAKES_MAP_ID);
    let countryMap = initCountryEarthQuakeMap(COUNTRY_EARTHQUAKES_MAP_ID);
    loadData((data) => {
      addDataToTimeMap(timeMap, data);
      addDataToCountryMap(countryMap, data);
    });
  
    window.addEventListener('resize', (event) => {
      let newSize = event.target.innerWidth/5;
      globe.width([newSize]);
      globe.height([newSize]);
    });

    window.isScriptLoaded = true;
  }
});
