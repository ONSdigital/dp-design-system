import { gtmDataLayerPush } from "../utilities";

const searchContainer = document.querySelector(".search__container");

const fetchHtml = async (url) => {
  const response = await fetch(url, {
    method: "get",
    mode: "cors",
    headers: new Headers({
      Accept: "application/json",
    }),
  });
  return response && (await response.text());
};

const replaceWithIEPollyfill = (el1, el2) => {
  // element.replaceWith() is not IE compatible, this is a workaround
  el1.insertAdjacentElement("beforebegin", el2);
  el1.parentElement.removeChild(el1);
};

const switchSearchMarkup = async (
  strParams,
  resetPagination = false,
  scrollToTop = false
) => {
  let theStringParams = strParams;
  if (resetPagination) {
    // reset to page 1 since filtering and sorting will change the length/order of results.
    theStringParams = theStringParams.replace(
      new RegExp(`[?&]page\=[^&]+`),
      "&page=1"
    );
  }

  const responseText = await fetchHtml(`/search${theStringParams}`);
  if (responseText) {
    const dom = new DOMParser().parseFromString(responseText, "text/html");

    // update the address bar
    history.pushState(null, "", `search${theStringParams}`);

    replaceWithIEPollyfill(
      searchContainer.querySelector(".search__results"),
      dom.querySelector(".search__results")
    );

    replaceWithIEPollyfill(
      searchContainer.querySelector(".search__pagination"),
      dom.querySelector(".search__pagination")
    );

    replaceWithIEPollyfill(
      searchContainer.querySelector(".search__summary__count"),
      dom.querySelector(".search__summary__count")
    );

    initPaginationListeners();

    // scroll to the top of the page after the content has been refreshed, to indicate a change has occured
    if (scrollToTop) {
      const searchResultsSection = searchContainer.querySelector(
        '[aria-label="Search results"]'
      );
      const resultsSectionOffsetFromTop =
        searchResultsSection.getBoundingClientRect().top +
        document.documentElement.scrollTop;
      window.scrollTo(0, resultsSectionOffsetFromTop);
    }
  }
};

const switchCheckbox = (paramsArray) => {
  // get current param
  let strParams = window.location.search;

  // build new param
  paramsArray.map((param) => {
    if (!("isChecked" in param) || !("filterName" in param)) return;
    if (param.isChecked) {
      strParams += `&filter=${param.filterName}`;
    } else {
      strParams = strParams.replace(
        new RegExp(`(\\&|\\?)filter\=${param.filterName}`),
        ""
      );
    }
  });

  // make the change to the markup
  switchSearchMarkup(strParams, true);
};

if (searchContainer) {

  // create listeners for checkboxes controlling eachother
  [
    ...searchContainer.querySelectorAll(
      ".ons-checkboxes__items [aria-controls]"
    ),
  ].map((topFilter) => {
    const childrenSelector = topFilter.getAttribute("aria-controls");
    const theChildren = [
      ...searchContainer.querySelectorAll(
        `#${childrenSelector} [type=checkbox]`
      ),
    ];
    if (!childrenSelector) return;
    topFilter.addEventListener("change", async (e) => {
      const paramsArray = theChildren.map((item) => ({
        isChecked: e.target.checked,
        filterName: item.value,
      }));
      theChildren.map((item) => (item.checked = e.target.checked));
      switchCheckbox(paramsArray);

      // Google Tag Manager
      gtmDataLayerPush({
        'event': 'Filter',
        'sort-by': findAndParseLabel(e.target.id),
        'selected': e.target.checked ? 'selected' : 'unselected'
      });
    });
    theChildren.map((item) => {
      item.addEventListener("change", async (e) => {
        switchCheckbox([
          { isChecked: e.target.checked, filterName: e.target.value },
        ]);
        topFilter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          'event': 'Filter',
          'sort-by': findAndParseLabel(e.target.id),
          'selected': e.target.checked ? 'selected' : 'unselected'
        });
      });
    });
  });

  const findAndParseLabel = (id) => {
    const theLabel = document.querySelector(`label[for="${id}"]`).innerText;
    return theLabel.replace(new RegExp(/\(\d*?\)/g), "").trim();
  }

  // create listeners for the sort dropdown
  const sortSelector = searchContainer.querySelector(".ons-input--sort-select");
  if (!!sortSelector) {
    sortSelector.addEventListener("change", async (e) => {
      let strParams = window.location.search;
      // remove old param
      strParams = strParams.replace(new RegExp(`[?&]sort\=[^&]+`), "");
      // replace
      strParams += `&sort=${e.target.value}`;
      switchSearchMarkup(strParams, true);

      // Google Tag Manager
      gtmDataLayerPush({
        'event': 'SortBy',
        'sort-by': e.target.value
      });
    });
  }

  // create listeners for the pagination
  const initPaginationListeners = () => {
    const paginationItems = searchContainer.querySelectorAll(
      ".ons-pagination__item a[data-target-page]"
    );
    if (!!paginationItems) {
      paginationItems.forEach((item) => {
        item.addEventListener("click", async (e) => {
          e.preventDefault();
          let strParams = window.location.search;
          const { targetPage } = e.target.dataset;
          if (!targetPage) return;
          // remove old param if it's there
          strParams = strParams.replace(new RegExp(`[?&]page\=[^&]+`), "");
          // add the new page target
          strParams += `&page=${targetPage}`;
          switchSearchMarkup(strParams, false, true);
        });
      });
    }
  };

  initPaginationListeners();

  // filter menu for mobile
  // if the page is running javascript let's make the filter menus togglable and full-screen when displayed
  const toggleBtns = [
    ...searchContainer.querySelectorAll(
      ".search__filter__mobile-filter-toggle"
    ),
  ];
  const filterMenu = searchContainer.querySelector("#search-filter");
  filterMenu.classList.add("js-fullscreen-filter-menu-content", "hide--sm");
  toggleBtns.map((btn) => {
    btn.classList.remove("hide");
    btn.addEventListener("click", () => {
      if (filterMenu.classList.contains("hide--sm")) {
        filterMenu.classList.remove("hide--sm");
      } else {
        filterMenu.classList.add("hide--sm");
      }
    });
  });
}
