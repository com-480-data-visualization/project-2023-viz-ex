const TILE_LAYER_URL = "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png";

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
      minZoom: 2,
    }).addTo(map);
  
    return map;
}
