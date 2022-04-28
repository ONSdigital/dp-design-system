// Google Tag Manager
export const gtmDataLayerPush = (obj) => {
    if ('dataLayer' in window) {
        window.dataLayer.push(obj);
    }
}

export const findNode = (rootNode, selector) => {
    if (typeof rootNode === "string") {
        selector = rootNode;
        rootNode = document;
    }

    const matches = rootNode.querySelectorAll(selector);
    return matches
        ? matches[0]
        : null;
}
