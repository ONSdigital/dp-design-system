// Google Tag Manager
export const gtmDataLayerPush = (obj) => {
    if('dataLayer' in window) {
        window.dataLayer.push(obj);
    }
}