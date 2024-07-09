// Google Tag Manager
export const gtmDataLayerPush = (obj) => {
  if ('dataLayer' in window) {
    window.dataLayer.push(obj);
  }
};

export const findNode = (rootNode, selector) => {
  let matches;
  if (typeof rootNode === 'string') {
    matches = document.querySelectorAll(rootNode);
  } else {
    matches = rootNode.querySelectorAll(selector);
  }

  return matches ? matches[0] : null;
};

export const daysBetween = (startDate, endDate) => {
  const difference = endDate.getTime() - startDate.getTime();
  const TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
};

export const fetchHtml = async (url) => {
  const response = await fetch(url, {
    method: 'get',
    mode: 'cors',
    headers: new Headers({
      Accept: 'application/json',
    }),
  });
  return response && response.text();
};

// element.replaceWith() is not IE compatible, this is a workaround
export const replaceWithIEPolyfill = (el1, el2) => {
  if (el1 !== null) {
    el1.insertAdjacentElement('beforebegin', el2);
    el1.parentElement.removeChild(el1);
  }
};
