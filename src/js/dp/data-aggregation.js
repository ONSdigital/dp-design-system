import { gtmDataLayerPush, fetchHtml, replaceWithIEPolyfill } from "../utilities";

const searchContainer = document.querySelector(".search__container");

if (searchContainer) {
  const scrollToTopOfSearch = () => {
    // scroll to the top of the page after the content has been refreshed, to indicate a change has occured
    const searchResultsSection = searchContainer.querySelector(
      "[aria-label='Search results']"
    );
    const resultsSectionOffsetFromTop =
      searchResultsSection.getBoundingClientRect().top +
      document.documentElement.scrollTop;
    window.scrollTo(0, resultsSectionOffsetFromTop);
  }

  const switchSearchMarkup = async (
    url,
    resetPagination = false,
    scrollToTop = false
  ) => {
    if (resetPagination) {
      /*
      * reset to page 1 since filtering and sorting will change the length/order of results.
      * in the case where it"s page one, remove page from searchParams.
      */
      url.searchParams.set("page", "1");
    }
    const resultsLoader = document.querySelector("#results-loading");

    const numOfParams = Array.from(url.searchParams).length

    /*
    * Current behaviour of search controller gets the results using fetch and render in page
    * However, if no filters are selected or no query - the fetched page has no results and
    * so they can"t be retrieved. This condition below bypasses that until it is fixed. 
    */
    const noFiltersSelected = numOfParams === 0 || (numOfParams === 1 && url.searchParams.has("page"));

    // if it takes more than 500ms to retreive results, show a loading message
    const timer = setTimeout(() => {
      if (resultsLoader) resultsLoader.classList.remove("hide");
      if (scrollToTop) scrollToTopOfSearch();
    }, 500);

    const responseText = await fetchHtml(url);
    clearTimeout(timer);

    if (scrollToTop) scrollToTopOfSearch();

    if (!responseText) {
      const pTag = resultsLoader.querySelector("p");
      if (pTag) pTag.innerText = pTag.dataset.errorMessage;
    } else {
      const fetchedDom = new DOMParser().parseFromString(responseText, "text/html");

      let resultsCount = 0;
      const searchPrompt = fetchedDom.querySelector(".search__form--no-results");
      if (!searchPrompt) {
        resultsCount = parseInt(fetchedDom.querySelector(".search__summary__count").innerText, 10);
      }

      const noResultsMessage = document.querySelector("#results-zero");

      if (resultsCount === 0) {
        if (noResultsMessage) {
          noResultsMessage.classList.remove("hide");
        }
        searchContainer.querySelector("#results > ul").innerHTML = "";
        searchContainer.querySelector(".search__pagination").innerHTML = "";
        searchContainer.querySelector(".search__summary__count").innerText = "0";
      } else {
        replaceWithIEPolyfill(
          searchContainer.querySelector(".search__results"),
          fetchedDom.querySelector(".search__results")
        );

        replaceWithIEPolyfill(
          searchContainer.querySelector(".search__pagination"),
          fetchedDom.querySelector(".search__pagination")
        );

        replaceWithIEPolyfill(
          searchContainer.querySelector(".search__summary__count"),
          fetchedDom.querySelector(".search__summary__count")
        );

        initPaginationListeners();
      }
    }

    // update the address bar
    history.pushState(null, "", decodeURIComponent(url));
  };

  const switchQuery = (paramsArray) => {
    // get current param
    let url = new URL(location.href);

    // build new param
    paramsArray.map((param) => {
      if (param && param.query) {
        if (!url.searchParams.get("q")) {
          url.searchParams.append("q", param.query);
        } else {
          url.searchParams.set("q", param.query);
        }
      } else {
        url.searchParams.delete("q");
      }
    });

    // make the change to the markup
    switchSearchMarkup(url, true);
  };

  const switchDate = (paramsArray, forAfterParams = true, forBeforeParams = true) => {
    // get current param
    let url = new URL(location.href);

    const afterKeyQueryArray = [
      {
        key: "afterYear",
        queryKey: "after-year"
      },
      {
        key: "afterMonth",
        queryKey: "after-month"
      },
      {
        key: "afterDate",
        queryKey: "after-day"
      }
    ];
    
    const beforeKeyQueryArray = [
      {
        key: "beforeYear",
        queryKey: "before-year"
      },
      {
        key: "beforeMonth",
        queryKey: "before-month"
      },
      {
        key: "beforeDate",
        queryKey: "before-day"
      }
    ]

    // build new param
    const addOrRemoveParam = (param, element) => {
      if (param && param[element.key]) {
        if (!url.searchParams.get(element.queryKey)) {
          url.searchParams.append(element.queryKey, param[element.key]);
        } else {
          url.searchParams.set(element.queryKey, param[element.key]);
        }
      } else {
        url.searchParams.delete(element.queryKey);
      }
    }

    paramsArray.map((param) => {
      if(forBeforeParams){
        beforeKeyQueryArray.forEach(element => {
          addOrRemoveParam(param, element);
        });
      }
      if(forAfterParams){
        afterKeyQueryArray.forEach(element => {
          addOrRemoveParam(param, element);
        });
      }
    });

    // make the change to the markup
    switchSearchMarkup(url, true);
  };

  // create listeners for content-type filter checkboxes controlling each other
  [
    ...searchContainer.querySelectorAll(
      ".content-type-filter"
    ),
  ].map((topFilter) => {
    // const childrenSelector = topFilter.getAttribute("aria-controls");
    const theChildren = [
      searchContainer.querySelector(
        `#keywords`
      ),
    ];
    topFilter.addEventListener("input", async (e) => {
      const paramsArray = theChildren.map((item) => ({
        query: item.value,
      }));
      switchQuery(paramsArray);
    });
  });

  // create listeners for the to-date filter inputs
  [
    ...searchContainer.querySelectorAll(
      ".to-date-filters"
    ),
  ].map((topFilter) => {
    const toYear = searchContainer.querySelector(`#toDateYear`);
    const toMonth = searchContainer.querySelector(`#toDateMonth`);
    const toDay = searchContainer.querySelector(`#toDateDay`);
    topFilter.addEventListener("input", async (e) => {
      const beforeParamsArray = [
        {
          beforeYear: toYear.value,
          beforeMonth: toMonth.value,
          beforeDate:toDay.value,
        }
      ];

      if (toYear.value.length > 3) {
        if ((toYear.value.length > 0 && toMonth.value.length > 0 && toDay.value.length > 0 )) {
          if(validateDates(beforeParamsArray[0])){
            switchDate(beforeParamsArray, false, true);
          }
        }
      }  
      
      if(toDay.value.length === 0 && toMonth.value.length === 0 &&  toYear.value.length === 0){
        switchDate([
          {
            beforeYear: 0,
            beforeMonth: 0,
            beforeDate: 0,
          }
        ], false, true);
      }
    });
  });

    // create listeners for the from-date filter inputs
    [
      ...searchContainer.querySelectorAll(
        ".from-date-filters"
      ),
    ].map((topFilter) => {
      const fromYear = searchContainer.querySelector(`#fromDateYear`);
      const fromMonth = searchContainer.querySelector(`#fromDateMonth`);
      const fromDay = searchContainer.querySelector(`#fromDateDay`);
      topFilter.addEventListener("input", async (e) => {
        const afterParamsArray = [
          {
            afterYear: fromYear.value,
            afterMonth: fromMonth.value,
            afterDate: fromDay.value,
          }
        ];
  
        if (fromYear.value.length > 3) {
          if ((fromYear.value.length > 0 && fromMonth.value.length > 0 && fromDay.value.length > 0)) {
            if(validateDates(afterParamsArray[0])){
              switchDate(afterParamsArray, true, false);
            }
          }
        }  
        
        if(fromDay.value.length === 0 && fromMonth.value.length === 0 && fromYear.value.length === 0){
          switchDate([
            {
              afterYear: 0,
              afterMonth: 0,
              afterDate: 0,
            }
          ], true, false);
        }
      });
    });

  [
    ...searchContainer.querySelectorAll(
        "#lastUpdatedSelect"
    ),
  ].map((topFilter) => {
      topFilter.addEventListener("input", async (e) => {
          var element = document.getElementById("dateFilters");
          if (topFilter.value === "custom") {
              if (element.classList.contains("hidden")) {
                  element.classList.remove("hidden");
              }
          } else {
              if (!element.classList.contains("hidden")) {
                  element.classList.add("hidden");
              }
  
              const dateToday = new Date();
  
              var fromDay, fromMonth, fromYear, toDay, toMonth, toYear;
  
              switch (topFilter.value) {
                  case "today":
                      fromDay = dateToday.getDate();
                      fromMonth = dateToday.getMonth() + 1;
                      fromYear = dateToday.getFullYear();
                      const dateTomorrow = new Date(dateToday)
                      dateTomorrow.setDate(dateTomorrow.getDate() + 1)
                      toDay = dateTomorrow.getDate();
                      toMonth = dateTomorrow.getMonth() + 1;
                      toYear = dateTomorrow.getFullYear();
                      break;
                  case "week":
                      toDay = dateToday.getDate();
                      toMonth = dateToday.getMonth() + 1;
                      toYear = dateToday.getFullYear();
                      const dateLastWeek = new Date(dateToday)
                      dateLastWeek.setDate(dateLastWeek.getDate() - 7)
                      fromDay = dateLastWeek.getDate();
                      fromMonth = dateLastWeek.getMonth() + 1;
                      fromYear = dateLastWeek.getFullYear();
                      break;
                  case "month":
                      toDay = dateToday.getDate();
                      toMonth = dateToday.getMonth() + 1;
                      toYear = dateToday.getFullYear();
                      const dateLastMonth = new Date(dateToday)
                      dateLastMonth.setMonth(dateLastMonth.getMonth());
                      fromDay = dateLastMonth.getDate();
                      fromMonth = dateLastMonth.getMonth();
                      fromYear = dateLastMonth.getFullYear();
                      break;
                  default:
  
                      break;
              }
              if (fromYear) {
                  const paramsArray = [
                      {
                          afterYear: fromYear,
                          afterMonth: fromMonth,
                          afterDate: fromDay,
                          beforeYear: toYear,
                          beforeMonth: toMonth,
                          beforeDate: toDay,
                      }
                  ]
                  switchDate(paramsArray);
              }
          }
      });
  });

  const validateDates = (datesArray) => {
    const releasedAfterContainer = document.querySelector(".inputs-released-after");
    const releasedBeforeContainer = document.querySelector(".inputs-released-before");
    const releaseAfterErrorElement = document.querySelector(".inputs-released-after-error");
    const releaseAfterErrorText = document.querySelector(".inputs-released-after-error-text");
    const releaseBeforeErrorElement = document.querySelector(".inputs-released-before-error");
    const releaseBeforeErrorText = document.querySelector(".inputs-released-before-error-text");
    const assistiveText = document.createElement("span");
    assistiveText.innerText = "Error: ";
    assistiveText.classList.add("ons-panel__assistive-text", "ons-u-vh");

    var validationError = false;

    const dayError = "The day parameter has to be between 1 and 31";
    const monthError = "The month parameter has to be between 1 and 12";
    const yearError = "The year parameter has to be higher than 1900";

    const clearErrors = () => {
      if(releasedAfterContainer.classList.contains("ons-panel--error", "ons-panel--no-title")){
        releasedAfterContainer.classList.remove("ons-panel--error", "ons-panel--no-title");
        releaseAfterErrorElement.classList.contains("hidden") ? '' : releaseAfterErrorElement.classList.add("hidden");
        if(releasedAfterContainer.querySelector('.ons-panel__assistive-text')){
          releasedAfterContainer.querySelector('.ons-panel__assistive-text').remove();
        }
      }
      if(releasedBeforeContainer.classList.contains("ons-panel--error", "ons-panel--no-title")){
        releasedBeforeContainer.classList.remove("ons-panel--error", "ons-panel--no-title");
        releaseBeforeErrorElement.classList.contains("hidden") ? '' : releaseBeforeErrorElement.classList.add("hidden");
        if(releasedBeforeContainer.querySelector('.ons-panel__assistive-text')){
          releasedBeforeContainer.querySelector('.ons-panel__assistive-text').remove();
        }
      }
    }

    const addError = (container, errorElement, errorTextElement, errorText) => {
      if(!container.classList.contains("ons-panel--error", "ons-panel--no-title")){
        container.classList.add("ons-panel--error", "ons-panel--no-title");
        errorElement.classList.contains("hidden") ? errorElement.classList.remove("hidden") : '';
        errorTextElement.innerText = errorText;
        if(!container.contains(assistiveText)){
          container.prepend(assistiveText);
        }
      }
    };

    //validate released after params
    if(datesArray["afterDate"] && (datesArray["afterDate"] > 31 || datesArray["afterDate"] < 1)){
      addError(releasedAfterContainer, releaseAfterErrorElement, releaseAfterErrorText, dayError);
      validationError = true;
    }
    if(datesArray["afterMonth"] && (datesArray["afterMonth"] > 12 || datesArray["afterMonth"] < 1)){
      addError(releasedAfterContainer, releaseAfterErrorElement, releaseAfterErrorText, monthError);
      validationError = true;
    }
    if(datesArray["afterYear"] && datesArray["afterYear"] < 1900){
      addError(releasedAfterContainer, releaseAfterErrorElement, releaseAfterErrorText, yearError);
      validationError = true;
    }

    //validate released before params
    if(datesArray["beforeDate"] && (datesArray["beforeDate"] > 31 || datesArray["beforeDate"] < 1)){
      addError(releasedBeforeContainer, releaseBeforeErrorElement, releaseBeforeErrorText, dayError);
      validationError = true;
    }
    if(datesArray["beforeMonth"] && (datesArray["beforeMonth"] > 12 || datesArray["beforeMonth"] < 1)){
      addError(releasedBeforeContainer, releaseBeforeErrorElement, releaseBeforeErrorText, monthError);
      validationError = true;
    }
    if(datesArray["beforeYear"] && datesArray["beforeYear"] < 1900){
      addError(releasedBeforeContainer, releaseBeforeErrorElement, releaseBeforeErrorText, yearError);
      validationError = true;
    }

    if(!validationError){
      clearErrors();
    }
    return !validationError;
  };

  const switchTopicFilterCheckbox = (paramsArray) => {
    // get current param
    let url = new URL(location.href);
    paramsArray.map((param) => {
      if (!("isChecked" in param) || !("topics" in param) || !("strParamType" in param)) return;
      let strParamType = param.strParamType;
      let tmpValues = url.searchParams.getAll(strParamType);
      url.searchParams.delete(strParamType);
      if (tmpValues.length <= 1) {
        if (param.isChecked) {
          if (tmpValues.length === 0) {
            tmpValues.push(param.topics);
            url.searchParams.append(strParamType, tmpValues);
          } else {
            let tmpValue = tmpValues[0].split(",");
            tmpValue.push(param.topics);
            url.searchParams.append(strParamType, tmpValue);
          }
        } else {
          if (tmpValues.length <= 1) {
            let tmpValue = tmpValues[0].split(",");
            let tmpParam = tmpValue.filter(e => e !== param.topics);
            if (tmpParam.length !== 0) {
              url.searchParams.append(strParamType, tmpParam);
            }
          }
        }
      }
    });

    // make the change to the markup
    switchSearchMarkup(url, true);
  };

  // create listeners for topic filter checkboxes
  [
    ...searchContainer.querySelectorAll(
      ".topic-filter [aria-controls]:not(input:disabled)"
    ),
  ].map((topicFilter) => {
    const childrenSelector = topicFilter.getAttribute("aria-controls");
    const theChildren = [
      ...searchContainer.querySelectorAll(
        `# searchContainer.querySelector{childrenSelector} [type=checkbox]`
      ),
    ];
    if (!childrenSelector) return;
    topicFilter.addEventListener("change", async (e) => {
      const paramsArray = theChildren.map((item) => ({
        isChecked: e.target.checked,
        topics: item.value,
        strParamType: "topics",
      }));
      theChildren.map((item) => (item.checked = e.target.checked));
      switchTopicFilterCheckbox(paramsArray);

      // Google Tag Manager
      gtmDataLayerPush({
        "event": "Topic-Filter",
        "filter-by": e.target.dataset.gtmLabel,
        "selected": e.target.checked ? "selected" : "unselected"
      });
    });
    theChildren.map((item) => {
      item.addEventListener("change", async (e) => {
        switchTopicFilterCheckbox([
          { isChecked: e.target.checked, topics: e.target.value, strParamType: "topics" },
        ]);
        topicFilter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          "event": "SubTopics-Filter",
          "filter-by": e.target.dataset.gtmLabel,
          "selected": e.target.checked ? "selected" : "unselected"
        });
      })
    })
  });

  // create listeners for population-types filter checkboxes
  [
    ...searchContainer.querySelectorAll(
      ".population-types"
    ),
  ].map((topicFilter) => {
    const theChildren = [
      ...topicFilter.querySelectorAll(
        `[type=checkbox]`
      ),
    ];

    if (!theChildren) return;
    theChildren.map((item) => {
      item.addEventListener("change", async (e) => {
        switchTopicFilterCheckbox([
          { isChecked: e.target.checked, topics: e.target.value, strParamType: "population_types" },
        ]);
        topicFilter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          "event": "PopulationTypes-Filter",
          "filter-by": e.target.dataset.gtmLabel,
          "selected": e.target.checked ? "selected" : "unselected"
        });
      })
    })
  });

  // create listeners for dimensions filter checkboxes
  [
    ...searchContainer.querySelectorAll(
      ".dimensions"
    ),
  ].map((topicFilter) => {
    const theChildren = [
      ...topicFilter.querySelectorAll(
        `[type=checkbox]`
      ),
    ];
    if (!theChildren) return;
    theChildren.map((item) => {
      item.addEventListener("change", async (e) => {
        switchTopicFilterCheckbox([
          { isChecked: e.target.checked, topics: e.target.value, strParamType: "dimensions" },
        ]);
        topicFilter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          "event": "Dimensions-Filter",
          "filter-by": e.target.dataset.gtmLabel,
          "selected": e.target.checked ? "selected" : "unselected"
        });
      })
    })
  });

  // create listeners for dimensions filter checkboxes
  [
    ...searchContainer.querySelectorAll(
      ".census"
    ),
  ].map((topicFilter) => {
    const theChildren = [
      ...topicFilter.querySelectorAll(
        "[type=checkbox]"
      ),
    ];
    if (!theChildren) return;
    theChildren.map((item) => {
      item.addEventListener("change", async (e) => {
        switchTopicFilterCheckbox([
          { isChecked: e.target.checked, topics: e.target.value, strParamType: "topics" },
        ]);
        topicFilter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          "event": "Census-Filter",
          "filter-by": e.target.dataset.gtmLabel,
          "selected": e.target.checked ? "selected" : "unselected"
        });
      })
    })
  });

  // create listeners for the sort dropdown
  const sortSelector = searchContainer.querySelector(".ons-input--sort-select");
  if (!!sortSelector) {
    sortSelector.addEventListener("change", async (e) => {
      let url = new URL(location.href);
      url.searchParams.set("sort", e.target.value)
      switchSearchMarkup(url, true);

      // Google Tag Manager
      gtmDataLayerPush({
        "event": "SortBy",
        "sort-by": e.target.value
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
          let url = new URL(location.href);
          const { targetPage } = e.target.dataset;
          if (!targetPage) return;
          url.searchParams.set("page", targetPage)
          switchSearchMarkup(url, false, true);
        });
      });
    }
    // adds the results per page functionality
    // let url = new URL(location.href);
    // const pageSizeSelector = searchContainer.querySelector("#page-size");
    // const pageSizeValue = searchContainer.querySelector("#page-size-value");
    // pageSizeSelector.value = pageSizeValue.value;
    // // create listener for the results per page filter
    // pageSizeSelector.addEventListener("input", async (e) => {
    //   if (!url.searchParams.get("limit")) {
    //     url.searchParams.append("limit", e.target.value);
    //   } else {
    //     url.searchParams.set("limit", e.target.value);
    //   }
    //   pageSizeSelector.value = e.target.value;
    //   // make the change to the markup
    //   switchSearchMarkup(url, false, true);
    // });
  };

  initPaginationListeners();

  const allReleasesCb = searchContainer.querySelector("#all-releases");

  if(allReleasesCb){
    allReleasesCb.addEventListener("input", async (e) => {
      let url = new URL(location.href);
      if(allReleasesCb.checked){
        if (!url.searchParams.get("allReleases")) {
          url.searchParams.append("allReleases", 1);
        } else {
          url.searchParams.set("allReleases", 1);
        }
      } else{
        url.searchParams.delete("allReleases");
  
      }
      // make the change to the markup
      switchSearchMarkup(url, true, false);
    });
  }

  // filter menu for mobile
  // if the page is running javascript let"s make the filter menus togglable and full-screen when displayed
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

  //capture focus in checkboxes
  const showResultsBtn = document.getElementById("show-results");
  const focusableElmnts = document.querySelectorAll("input[type='checkbox']:not([disabled]), #clear-search");
  const firstFocusableElmnt = focusableElmnts[0];

  if (showResultsBtn) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (document.activeElement === showResultsBtn) {
          firstFocusableElmnt.focus();
          e.preventDefault();
        }
      }
    });

    //tab to checkboxes after filtering results
    const filterBtn = document.getElementById("filter-results");
    if (filterBtn) {
      document.addEventListener("click", () => {
        if (document.activeElement === filterBtn) {
          firstFocusableElmnt.focus();
        }
      });
    }
  }
}
