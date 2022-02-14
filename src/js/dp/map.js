/**
 * Requirements:
 * `npm i -S mapbox-gl-js`
 * Example setup:
 * The map component requires 3 data attribute values:
 * @param {String} style Either url or path name
 * @param {Array<String>} center geolocation coordinates as a starting location for the map display 
 * @param {Number} zoom Optional - default 6
 * @param {String} token Optional - default undefined
 * ```     
 *      <div 
 *          class="margin-top-sm--5 margin-top-md--8 margin-top-lg--8"
 *           id="map"
 *           data-style="mapbox://styles/mapbox/streets-v11"
 *           data-center="[-0.5302797870344023, 52.27346293866273]"
 *           data-token="pk.eyJ1Ijoiam9lZ29vc2ViYXNzIiwiYSI6ImNsMDltMGlwczBidXMzaXJxMWpleGRybm8ifQ.Xlzr3E2l2fSUxvUvt5ndkA"
 *           data-zoom="6">
 *           <div class="ons-map-control">
 *               <div class="ons-ctrl-group">
 *                   <button class="ons-ctrl-zoom-in">
 *                       <span class="ons-ctrl-reset"></span>
 *                   </button>
 *                   <button class="ons-ctrl-reset">
 *                       <span class="ons-ctrl-reset"></span>
 *                   </button>
 *                   <button class="ons-ctrl-zoom-out">
 *                       <span class="ons-ctrl-reset"></span>
 *                   </button>
 *                   <button class="ons-ctrl-fullscreen">
 *                       <span class="ons-ctrl-reset"></span>
 *                   </button>
 *               </div>
 *           </div>
 *      </div>
 * ```
 */
 let mapID = document.getElementById("map");
 let mapboxgl = null; // mapbox-gl-js 
 if (mapID) {
     try {
        mapboxgl = require("mapbox-gl");
     } catch {
         console.error("Cannot find module 'mapbox-gl'");
     }
    
 }
 /** @internal */
 const _getMapStyle = (mapEl) =>  {
     const mapStyle = mapEl.dataset.style;
     if (!mapStyle) {
         throw new Error("You must define a style value url or path!");
     }
     return mapStyle
 };
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
 };
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
 };
 /** @internal */
 const _getToken = (mapEl) => {
     return mapEl.dataset.token;
 }
 /** @internal */
 class MapState {
     constructor() {
         this.context = {
             hasMoved: false,
         };
     }
     
     update(state = {}) {
         this.context = { 
             ...this.context,
              ...state,
         };
     }
 }
 class ONSControl  {
     state = new MapState();
     
     constructor(map, btnSelector, btnClickedSelctor = null) {
        this.map = map;
        this.btnSelector = btnSelector;
        if (typeof this.btnSelector === "undefined") {
            throw new Error(`ONSZoomInControl - button selector '${this.btnSelector}' is undefined`);
        }
        this.btnClickedSelctor = btnClickedSelctor;
     }

     setup() {
         // button
        this.button = document.querySelector(this.btnSelector);
        if (!this.button) {
            throw new Error(`ONSZoomInControl - Can't add event handler to non existing element!`);
        }
        this.button.addEventListener("click", this.onClick)
        // span.mapboxgl-ctrl-icon
        this.iconElement = this.button.querySelector(".mapboxgl-ctrl-icon");
     }

    styleBtnDefault() {
        this.iconElement.className = "mapboxgl-ctrl-icon";
    }

    styleBtnNonDefault() {
        this.iconElement.className = `mapboxgl-ctrl-icon ${this.btnClickedSelctor}`;
    }
 }

 class ONSZoomInControl extends ONSControl {

    constructor(map, btnSelector, btnClickedSelctor) {
        super(map, btnSelector, btnClickedSelctor);
    }

    onClick = (e) => {
       this.map.zoomIn({ duration: 1000 });
    }
}
 
 class ONSZoomOutControl extends ONSControl {
    constructor(map, btnSelector, btnClickedSelctor) {
        super(map, btnSelector, btnClickedSelctor);
    }

    onClick = (e) => {
       this.map.zoomOut({ duration: 1000 });

    }
 }

 class ONSResetControl extends ONSControl {
    constructor(map, btnSelector, btnClickedSelctor, center, zoom) {
        super(map, btnSelector, btnClickedSelctor);
        this.center = center;
        this.zoom = zoom;
        this.iconElement = null;
    }

    setup() {
        super.setup();
        this.button.disabled = true;
        this.styleBtnNonDefault();
        this.map.on("movestart", this.onMoveStart);
    }

    onMoveStart = () => {
        // update reset btn default icon
        if (!this.state.context.hasMoved) {
            this.state.update({ hasMoved: false });
            this.button.disabled = false;
            this.styleBtnDefault();
        }
    }

    onClick = (e) => {
       this.map.flyTo({
            center: this.center,
            zoom: this.zoom,
        });
       this.state.update({ hasMoved: false });
       this.styleBtnNonDefault();
    }
 }

 class ONSFullScreenControl extends ONSControl {
    constructor(map, btnSelector, btnClickedSelctor) {
        super(map, btnSelector, btnClickedSelctor);
    }

    openFullScreenMode() {
        const el = this.map._container;
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    }

    exitFullScreenMode() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    isInFullScreenMode() {
        return (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement
        );
    }

    onClick = (e) => {
        if (this.isInFullScreenMode()) {
            this.exitFullScreenMode();
            this.button.className = "ons-ctrl-fullscreen";
        } else {
            this.openFullScreenMode();
            this.button.className = "ons-ctrl-shrink";
        }
    }
 }

 /** @internal */
 function _createMap() {
     const mapIDName = "map";
     const mapElem = document.getElementById(mapIDName);
     const bounds = [
         [-7.9454024125535625, 48.95006696529006], // south-west
         [2.549589409450192, 60.86791183866015], // north-west
     ];
     if (!mapElem) {
         throw new Error("To use the OSD Map Component you must declare an id of 'map' on the containing HTML element");
     }
     // Style
     const mapStyle = _getMapStyle(mapElem);
     // Zoom
     let mapZoom = _getMapZoom(mapElem);
     // Center
     const mapCenter = _getMapCenter(mapElem);
     // Access Token
     const accessToken = _getToken(mapElem);
     // Map Context
     const mapState = new MapState();
     // Mapbox
     mapboxgl.accessToken = accessToken;
     const map = new mapboxgl.Map({
         container: mapIDName,
         style: mapStyle,
         center: mapCenter,
         zoom: mapZoom,
         attributionControl: false,
         maxBounds: bounds,
     });
     /** -------- Controls ----------- */
    const onsZoomInControl = new ONSZoomInControl(map, ".ons-ctrl-zoom-in", "");
    onsZoomInControl.setup();
    const onsZoomOutControl = new ONSZoomOutControl(map, ".ons-ctrl-zoom-out", "");
    onsZoomOutControl.setup();
    const onsResetControl = new ONSResetControl(map, ".ons-ctrl-reset", "mapboxgl-ctrl-icon--disabled", mapCenter, mapZoom);
    onsResetControl.setup();
    const onsFullScreenControl = new ONSFullScreenControl(map, ".ons-ctrl-fullscreen", "mapboxgl-ctrl-icon--fullscreen");
    onsFullScreenControl.setup();

     map.dragRotate.disable();
     map.touchZoomRotate.disableRotation();
     // Set tab indexes
    //  map.getCanvas().setAttribute("tabindex", "0");
     /** -------- Events ----------- */
     map.on("load", () => {
         // Resize map to as setting the height and width in css distorts the ratio of the map
         map.resize();
     });
     map.on("move", () => {
         /** ------- Debugging TODO remove -------- */
        console.debug("center: ", map.getCenter()); 
        console.debug("zoom: ", map.getZoom()); 
     });
 }
 /** @internal */
 function _initMap() {
     window.addEventListener("DOMContentLoaded", () => {
         if (mapID) {
             _createMap();
         }
     });
 }
 
 /** -------- Iniate map.js -------- */
 _initMap();
 