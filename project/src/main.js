import L from 'leaflet'

const whenDocumentLoaded = (action) => {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
    if (!window.isScriptLoaded) {
        console.log("asdfasdf")
        const mapObj = L.map('map').setView([51.505, -0.09], 13);

        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attributionControl:false
        }).addTo(mapObj);
        
        window.isScriptLoaded= true;
    }
    
	// plot object is global, you can inspect it in the dev-console
});
