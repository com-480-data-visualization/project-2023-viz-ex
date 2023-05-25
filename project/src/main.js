import { csv } from "d3";
import { initTimeEarthQuakeMap, addDataToTimeMap, TIME_QUAKES_MAP_ID } from "./map/time-map";
import { COUNTRY_EARTHQUAKES_MAP_ID, addDataToCountryMap, initCountryEarthQuakeMap } from "./map/country-map";
 
const loadData = (afterLoadCallback) => {
  csv("./data/database.csv").then((data) => {
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
    let timeMap = initTimeEarthQuakeMap(TIME_QUAKES_MAP_ID);
    let countryMap = initCountryEarthQuakeMap(COUNTRY_EARTHQUAKES_MAP_ID);
    loadData((data) => {
      addDataToTimeMap(timeMap, data);
      addDataToCountryMap(countryMap, data);
    });
    window.isScriptLoaded = true;
  }
});
