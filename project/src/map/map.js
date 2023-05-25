
const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const initMap = (mapId) => {
    let map = L.map(mapId)
      .setView([40.737, -73.923], 2) // center position + zoom
      .setMaxBounds([
        [-90, -180],
        [90, 180],
      ]); // set max bounds to entire map
   
    // Add a tile to the map = a background. Comes from OpenStreetmap
    L.tileLayer(TILE_LAYER_URL, {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 10,
    }).addTo(map);
    
    // // SVG Layer
    // var svgLayer = new L.SVG({pane:'markerPane'})
    // svgLayer.addTo(map);
  
    return map;
}
