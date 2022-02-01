const fetchHtml = async (url) => {
  const response = await fetch(url, {
    method: "get",
    mode: "cors",
    headers: new Headers({
      Accept: "application/json",
    }),
  });
  return response && await response.text();
};

const replaceWithPolyfill = (el1, el2) => {
  el1.insertAdjacentElement('beforebegin', el2);
  el1.parentElement.removeChild(el1); // absolutely ridiculous
  
}

const switchSearchMarkup = async (strParams, resetPagination = false) => {
  let theStringParams = strParams;
  if(resetPagination){
    // reset to page 1 since filtering and sorting will change the length/order of results.
    theStringParams = theStringParams.replace(new RegExp(`[?&]page\=[^&]+`), "page=1");
  }

  const responseText = await fetchHtml(`/search${theStringParams}`);
  if (responseText) {
    const dom = new DOMParser().parseFromString(responseText, "text/html");

    // update the address bar
    history.pushState(null, '', `search${theStringParams}`);

    replaceWithPolyfill(
      document.querySelector(".search__results"), 
      dom.querySelector(".search__results")
    );

    replaceWithPolyfill(
      document.querySelector(".search__pagination"), 
      dom.querySelector(".search__pagination")
    );
    
    initPaginationListeners();
  }
}

const switchCheckbox = (paramsArray) => {
  // get current param
  let strParams = window.location.search; 

  // build new param
  paramsArray.map((param) => {
    if(!('isChecked' in param) || !('filterName' in param)) return;
    if (param.isChecked) {
      strParams += `&filter=${param.filterName}`;
    } else {
      strParams = strParams.replace(new RegExp(`(\\&|\\?)filter\=${param.filterName}`), "")
    }
  });

  // make the change to the markup
  switchSearchMarkup(strParams, true)
}

// create listeners for checkboxes controlling eachother
[...document.querySelectorAll('.ons-checkboxes__items [aria-controls]')].map(topFilter => {
  const childrenSelector = topFilter.getAttribute('aria-controls');
  const theChildren = [...document.querySelectorAll(`#${childrenSelector} [type=checkbox]`)];
  if(!childrenSelector) return;
  topFilter.addEventListener("change", async (e) => {
      const paramsArray = theChildren.map(item => ({isChecked: e.target.checked, filterName: item.value}));
      theChildren.map(item => item.checked = e.target.checked);
      switchCheckbox(paramsArray);
  });
  theChildren.map((item) => {
      item.addEventListener("change", async (e) => {
        switchCheckbox([{isChecked: e.target.checked, filterName: e.target.value}]);
        topFilter.checked = theChildren.some(x => x.checked);
      })
  });    
});

// create listeners for the sort dropdown
const sortSelector = document.querySelector(".ons-input--sort-select");
if(!!sortSelector) {
  sortSelector.addEventListener("change", async (e) => {
    let strParams = window.location.search;
    // remove old param
    strParams = strParams.replace(new RegExp(`[?&]sort\=[^&]+`), "")
    // replace
    strParams += `&sort=${e.target.value}`;
    switchSearchMarkup(strParams, true)
  });
}

// create listeners for the pagination
const initPaginationListeners = () => {
  const paginationItems = document.querySelectorAll(".ons-pagination__item a[data-target-page]");
  if(!!paginationItems) {
    paginationItems.forEach((item) => {
      item.addEventListener("click", async (e) => {
        e.preventDefault();
        let strParams = window.location.search;
        const { targetPage } = e.target.dataset;
        if( !targetPage ) return;
        // remove old param if it's there
        strParams = strParams.replace(new RegExp(`[?&]page\=[^&]+`), "");
        // add the new page target
        strParams += `&page=${targetPage}`;
        switchSearchMarkup(strParams)
      });
    });
  }
}

initPaginationListeners();