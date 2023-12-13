function clearViewportSizes() {
  document.body.classList.remove('viewport-sm', 'viewport-md', 'viewport-lg');
}

function jsEnhanceViewportSize() {
  const viewportDivs = document.querySelectorAll('.js-viewport-size');
  if (viewportDivs) {
    viewportDivs.forEach((div) => {
      if (window.getComputedStyle(div).display === 'block') {
        clearViewportSizes();
        const idName = div.id;
        document.body.classList.add(idName);
      }
    });
  }
}

function initViewportSize() {
  const footers = document.querySelector('footer');
  if (footers) {
    // Get the last one expected to be the main one for the page
    const viewportDivHTML = "<div id='viewport-sm' class='js-viewport-size'></div>"
      + "<div id='viewport-md' class='js-viewport-size'></div>"
      + "<div id='viewport-lg' class='js-viewport-size'></div>";

    footers.insertAdjacentHTML('beforeend', viewportDivHTML);

    jsEnhanceViewportSize();
  }
}

document.addEventListener('DOMContentLoaded', initViewportSize);

window.addEventListener('resize', () => {
  jsEnhanceViewportSize();
});
