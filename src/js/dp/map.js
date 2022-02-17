/** @internal */
const _getMapStyle = (mapEl) =>  {
    const mapStyle = mapEl.dataset.style;
    if (!mapStyle) {
        throw new Error("You must define a style value url or path!");
    }
    return mapStyle
}

/** @internal */
const _getMapCenter = (mapEl) => {
    let mapCenter = mapEl.dataset.center;
    if (!mapCenter) {
        throw new Error("You must declare a 'data-center' attribute");
    }
    mapCenter = mapCenter.replace(/\[|]/g, "");
    if (mapCenter.length < 2) throw new Error(centerErrorMsg);
    mapCenter = mapCenter.split(",");
    mapCenter = mapCenter.map(center => {
        return parseInt(center);
    });
    return mapCenter;
}

/** @internal */
const _getMapZoom = (mapEl) => {
    let mapZoom = parseInt(mapEl.dataset.zoom)
    if (!mapZoom) {
        mapZoom = 3;
        console.warn("OSD Map Component: defaulting the zoom value to 3");
    } else {
        mapZoom =  parseInt(mapEl.dataset.zoom)
    }
    return mapZoom;
}

/** @internal */
function _createMap() {
    const centerErrorMsg = "ONS Map Component Error: data-center attribute must be declared" +
    "as an array with 2 geolocation codes \n" +
    "\te.g data-center='[51.42133794405771, -0.14646169096877365]'.\nFull error below:";
    // ID
    const mapIDName = "map";
    const mapElem = document.getElementById(mapIDName);
    if (!mapElem) {
        throw new Error("To use the OSD Map Component you must declare an id of 'map' on the containing HTML element");
    }
    // Style
    const mapStyle = _getMapStyle(mapElem);
    // Zoom
    let mapZoom = _getMapZoom(mapElem);
    // Center
    mapCenter = _getMapCenter(mapElem);
    
    const map = new mapboxgl.Map({
        container: mapIDName,
        style: mapStyle,
        center: mapCenter,
        zoom: mapZoom,
    });
}

/**
 * Example setup:
 * The map component requires 3 data attribute values:
 * @param {String} style Either url or path name
 * @param {Array<String>} center geolocation coordinates as a starting location for the map display 
 * @param {Number} zoom
 * ```     
 *    <div 
 *       id="map"
 *       data-style="mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g?access_code=<key>"
 *       data-center="[51.42133794405771, -0.14646169096877365]"
 *       data-zoom="3"
 *   ></div> 
 * ```
 */
function initMap() {
    window = window || {};
    console.log("Loading map...")
    window.addEventListener("load", _createMap);
}
