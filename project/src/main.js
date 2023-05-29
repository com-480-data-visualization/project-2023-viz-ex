import { csv } from "d3";
import { initTimeEarthQuakeMap, addDataToTimeMap, TIME_QUAKES_MAP_ID } from "./map/time-map";
import { COUNTRY_EARTHQUAKES_MAP_ID, addDataToCountryMap, initCountryEarthQuakeMap } from "./map/country-map";
import { initWorld } from "./background-globe.js";
import { initRadialChart } from "./map/radial-chart";

const loadData = (url, afterLoadCallback) => {
  csv(url).then((data) => {
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
    let globe = initWorld();
    let timeMap = initTimeEarthQuakeMap(TIME_QUAKES_MAP_ID);
    let countryMap = initCountryEarthQuakeMap(COUNTRY_EARTHQUAKES_MAP_ID);
    loadData(`${document.baseURI}data/database.csv`, (data) => {
      addDataToTimeMap(timeMap, data);
      addDataToCountryMap(countryMap, data);
    });

    loadData(`${document.baseURI}data/database.csv`, (data)=>{
      initRadialChart(data);
    })
  
    window.addEventListener('resize', (event) => {
      let newSize = event.target.innerWidth/5;
      globe.width([newSize]);
      globe.height([newSize]);
    });

    window.isScriptLoaded = true;
  }
});
