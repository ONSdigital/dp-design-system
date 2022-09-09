import { gtmDataLayerPush } from "../utilities";

const searchContainer = document.querySelector(".search__container");

if (searchContainer) {
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

  const scrollToTopOfSearch = () => {
    // scroll to the top of the page after the content has been refreshed, to indicate a change has occured
    const searchResultsSection = searchContainer.querySelector(
      '[aria-label="Search results"]'
    );
    const resultsSectionOffsetFromTop =
      searchResultsSection.getBoundingClientRect().top +
      document.documentElement.scrollTop;
    window.scrollTo(0, resultsSectionOffsetFromTop);
  }

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

    // if it takes more than 500ms to retreive results, show a loading message
    const resultsLoader = document.querySelector('#results-loading');
    setTimeout(() => {
      if (resultsLoader) resultsLoader.classList.remove('hide');
      if (scrollToTop) scrollToTopOfSearch();
    }, 500);

    const responseText = await fetchHtml(`/search${theStringParams}`);

    if (scrollToTop) scrollToTopOfSearch();

    if (!responseText) {
      const pTag = resultsLoader.querySelector('p');
      if(pTag) pTag.innerText = pTag.dataset.errorMessage;
    } else {
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
    }
  };

  const switchContentTypeFilterCheckbox = (paramsArray) => {
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
  
  // create listeners for content-type filter checkboxes controlling each other
  [
    ...searchContainer.querySelectorAll(
      ".content-type-filter [aria-controls]:not(input:disabled)"
    ),
  ].map((topFilter) => {
    const childrenSelector = topFilter.getAttribute("aria-controls");
    const theChildren = [
      ...searchContainer.querySelectorAll(
        `#${childrenSelector} [type=checkbox]:not(input:disabled)`
      ),
    ];
    if (!childrenSelector) return;
    topFilter.addEventListener("change", async (e) => {
      const paramsArray = theChildren.map((item) => ({
        isChecked: e.target.checked,
        filterName: item.value,
      }));
      theChildren.map((item) => (item.checked = e.target.checked));
      switchContentTypeFilterCheckbox(paramsArray);

      // Google Tag Manager
      gtmDataLayerPush({
        'event': 'Filter',
        'filter-by': e.target.dataset.gtmLabel,
        'selected': e.target.checked ? 'selected' : 'unselected'
      });
    });
    theChildren.map((item) => {
      item.addEventListener("change", async (e) => {
        switchContentTypeFilterCheckbox([
          { isChecked: e.target.checked, filterName: e.target.value },
        ]);
        topFilter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          'event': 'ContentType-Filter',
          'filter-by': e.target.dataset.gtmLabel,
          'selected': e.target.checked ? 'selected' : 'unselected'
        });
      });
    });
  });

  const switchTopicFilterCheckbox = (paramsArray) => {
    // get current param
    let strParams = window.location.search;

    // build new param
    paramsArray.map((param) => {
      if (!("isChecked" in param) || !("topics" in param)) return;
      
      strParams = strParams.replace(
        new RegExp(/&topics=\w*/gi),
        ""
      );
      
      if (param.isChecked) {
        strParams += `&topics=${param.topics}`;
      }
    });

    // make the change to the markup
    switchSearchMarkup(strParams, true);
  };

  // create listeners for topic filter checkboxes
  [
    ...searchContainer.querySelectorAll(
      ".topic-filter [name]:not(input:disabled)"
    ),
  ].map((topicFilter) => {
    topicFilter.addEventListener("change", async (e) => {
      switchTopicFilterCheckbox([
        { isChecked: e.target.checked, topics: e.target.value },
      ]);

      // Google Tag Manager
      gtmDataLayerPush({
        'event': 'Topic-Filter',
        'filter-by': e.target.dataset.gtmLabel,
        'selected': e.target.checked ? 'selected' : 'unselected'
      });
    });
  });

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
  if (filterMenu) {
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
  };
}
