import { gtmDataLayerPush, fetchHtml, replaceWithIEPolyfill } from '../utilities';

const searchContainer = document.querySelector('.search__container');

if (searchContainer) {
  const scrollToTopOfSearch = () => {
    // scroll to the top of the page after the content has been refreshed, to indicate a change
    // has occurred
    const searchResultsSection = searchContainer.querySelector(
      '[aria-label="Search results"]',
    );
    const resultsSectionOffsetFromTop = searchResultsSection.getBoundingClientRect().top
      + document.documentElement.scrollTop;
    window.scrollTo(0, resultsSectionOffsetFromTop);
  };

  const switchSearchMarkup = async (
    url,
    resetPagination = false,
    scrollToTop = false,
  ) => {
    if (resetPagination) {
      /*
      * reset to page 1 since filtering and sorting will change the length/order of results.
      * in the case where it's page one, remove page from searchParams.
      */
      url.searchParams.set('page', '1');
    }
    const resultsLoader = document.querySelector('#results-loading');

    // if it takes more than 500ms to retreive results, show a loading message
    const timer = setTimeout(() => {
      if (resultsLoader) resultsLoader.classList.remove('hide');
      if (scrollToTop) scrollToTopOfSearch();
    }, 500);

    const responseText = await fetchHtml(url);
    clearTimeout(timer);

    if (scrollToTop) scrollToTopOfSearch();

    if (!responseText) {
      const pTag = resultsLoader.querySelector('p');
      if (pTag) pTag.innerText = pTag.dataset.errorMessage;
    } else {
      const fetchedDom = new DOMParser().parseFromString(responseText, 'text/html');

      let resultsCount = 0;
      const searchPrompt = fetchedDom.querySelector('.search__form--no-results');
      if (!searchPrompt) {
        resultsCount = parseInt(fetchedDom.querySelector('.search__summary__count').innerText, 10);
      }

      const noResultsMessage = document.querySelector('#results-zero');

      if (resultsCount === 0) {
        if (noResultsMessage) {
          noResultsMessage.classList.remove('hide');
        }
        searchContainer.querySelector('#results > ul').innerHTML = '';
        searchContainer.querySelector('.search__pagination').innerHTML = '';
        searchContainer.querySelector('.search__summary__count').innerText = '0';
      } else {
        replaceWithIEPolyfill(
          searchContainer.querySelector('.search__results'),
          fetchedDom.querySelector('.search__results'),
        );

        replaceWithIEPolyfill(
          searchContainer.querySelector('.search__pagination'),
          fetchedDom.querySelector('.search__pagination'),
        );

        replaceWithIEPolyfill(
          searchContainer.querySelector('.search__summary__count'),
          fetchedDom.querySelector('.search__summary__count'),
        );

        // TODO: this func or initPaginationListeners need breaking up to allow move
        // eslint-disable-next-line no-use-before-define
        initPaginationListeners();
      }
    }

    // update the address bar
    window.history.pushState(null, '', decodeURIComponent(url));
  };

  const switchContentTypeFilterCheckbox = (paramsArray) => {
    // get current param
    const url = new URL(window.location.href);

    // build new param
    paramsArray.forEach((param) => {
      if (!('isChecked' in param) || !('filterName' in param)) return;
      if (param.isChecked) {
        url.searchParams.append('filter', param.filterName);
      } else {
        const tmpValues = url.searchParams.getAll('filter').filter((e) => e !== param.filterName);
        url.searchParams.delete('filter');
        if (tmpValues.length !== 0) {
          tmpValues.forEach((x) => {
            url.searchParams.append('filter', x);
          });
        }
      }
    });

    // make the change to the markup
    switchSearchMarkup(url, true);
  };

  // create listeners for content-type filter checkboxes controlling each other
  [
    ...searchContainer.querySelectorAll(
      '.content-type-filter [aria-controls]:not(input:disabled)',
    ),
  ].forEach((topFilter) => {
    const childrenSelector = topFilter.getAttribute('aria-controls');
    let theChildren = [
      ...searchContainer.querySelectorAll(
        `#${childrenSelector} [type=checkbox]:not(input:disabled)`,
      ),
    ];
    if (!childrenSelector) return;
    topFilter.addEventListener('change', async (e) => {
      const paramsArray = theChildren.map((item) => ({
        isChecked: e.target.checked,
        filterName: item.value,
      }));
      theChildren = theChildren.map(
        (item) => {
          const checkbox = item;
          checkbox.checked = e.target.checked;
          return checkbox;
        },
      );
      switchContentTypeFilterCheckbox(paramsArray);

      // Google Tag Manager
      gtmDataLayerPush({
        event: 'Filter',
        'filter-by': e.target.dataset.gtmLabel,
        selected: e.target.checked ? 'selected' : 'unselected',
      });
    });
    theChildren.forEach((item) => {
      item.addEventListener('change', async (e) => {
        switchContentTypeFilterCheckbox([
          { isChecked: e.target.checked, filterName: e.target.value },
        ]);
        const filter = topFilter;
        filter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          event: 'ContentType-Filter',
          'filter-by': e.target.dataset.gtmLabel,
          selected: e.target.checked ? 'selected' : 'unselected',
        });
      });
    });
  });

  const switchTopicFilterCheckbox = (paramsArray) => {
    // get current param
    const url = new URL(window.location.href);
    paramsArray.forEach((param) => {
      if (!('isChecked' in param) || !('topics' in param) || !('strParamType' in param)) return;
      const { strParamType } = param;
      const tmpValues = url.searchParams.getAll(strParamType);
      url.searchParams.delete(strParamType);
      if (tmpValues.length <= 1) {
        if (param.isChecked) {
          if (tmpValues.length === 0) {
            tmpValues.push(param.topics);
            url.searchParams.append(strParamType, tmpValues);
          } else {
            const tmpValue = tmpValues[0].split(',');
            tmpValue.push(param.topics);
            url.searchParams.append(strParamType, tmpValue);
          }
        } else if (tmpValues.length === 1) {
          const tmpValue = tmpValues[0]?.split(',');
          const tmpParam = tmpValue?.filter((e) => e !== param.topics);
          if (tmpParam?.length !== 0) {
            url.searchParams.append(strParamType, tmpParam);
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
      '.topic-filter [aria-controls]:not(input:disabled)',
    ),
  ].forEach((topicFilter) => {
    const childrenSelector = topicFilter.getAttribute('aria-controls');
    const theChildren = [
      ...searchContainer.querySelectorAll(
        `#${childrenSelector} [type=checkbox]`,
      ),
    ];
    if (!childrenSelector) return;
    topicFilter.addEventListener('change', async (e) => {
      const paramsArray = theChildren.map((item) => ({
        isChecked: e.target.checked,
        topics: item.value,
        strParamType: 'topics',
      }));
      theChildren.map(
        (item) => {
          const checkbox = item;
          checkbox.checked = e.target.checked;
          return checkbox;
        },
      );
      switchTopicFilterCheckbox(paramsArray);

      // Google Tag Manager
      gtmDataLayerPush({
        event: 'Topic-Filter',
        'filter-by': e.target.dataset.gtmLabel,
        selected: e.target.checked ? 'selected' : 'unselected',
      });
    });
    theChildren.forEach((item) => {
      item.addEventListener('change', async (e) => {
        switchTopicFilterCheckbox([
          { isChecked: e.target.checked, topics: e.target.value, strParamType: 'topics' },
        ]);
        const filter = topicFilter;
        filter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          event: 'SubTopics-Filter',
          'filter-by': e.target.dataset.gtmLabel,
          selected: e.target.checked ? 'selected' : 'unselected',
        });
      });
    });
  });

  // create listeners for population-types filter checkboxes
  [
    ...searchContainer.querySelectorAll(
      '.population-types',
    ),
  ].forEach((topicFilter) => {
    const theChildren = [
      ...topicFilter.querySelectorAll(
        '[type=checkbox]',
      ),
    ];

    if (!theChildren) return;
    theChildren.forEach((item) => {
      item.addEventListener('change', async (e) => {
        switchTopicFilterCheckbox([
          { isChecked: e.target.checked, topics: e.target.value, strParamType: 'population_types' },
        ]);
        const filter = topicFilter;
        filter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          event: 'PopulationTypes-Filter',
          'filter-by': e.target.dataset.gtmLabel,
          selected: e.target.checked ? 'selected' : 'unselected',
        });
      });
    });
  });

  // create listeners for dimensions filter checkboxes
  [
    ...searchContainer.querySelectorAll(
      '.dimensions',
    ),
  ].forEach((topicFilter) => {
    const theChildren = [
      ...topicFilter.querySelectorAll(
        '[type=checkbox]',
      ),
    ];
    if (!theChildren) return;
    theChildren.forEach((item) => {
      item.addEventListener('change', async (e) => {
        switchTopicFilterCheckbox([
          { isChecked: e.target.checked, topics: e.target.value, strParamType: 'dimensions' },
        ]);
        const filter = topicFilter;
        filter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          event: 'Dimensions-Filter',
          'filter-by': e.target.dataset.gtmLabel,
          selected: e.target.checked ? 'selected' : 'unselected',
        });
      });
    });
  });

  // create listeners for dimensions filter checkboxes
  [
    ...searchContainer.querySelectorAll(
      '.census',
    ),
  ].forEach((topicFilter) => {
    const theChildren = [
      ...topicFilter.querySelectorAll(
        '[type=checkbox]',
      ),
    ];
    if (!theChildren) return;
    theChildren.forEach((item) => {
      item.addEventListener('change', async (e) => {
        switchTopicFilterCheckbox([
          { isChecked: e.target.checked, topics: e.target.value, strParamType: 'topics' },
        ]);
        const filter = topicFilter;
        filter.checked = theChildren.some((x) => x.checked);

        // Google Tag Manager
        gtmDataLayerPush({
          event: 'Census-Filter',
          'filter-by': e.target.dataset.gtmLabel,
          selected: e.target.checked ? 'selected' : 'unselected',
        });
      });
    });
  });

  // create listeners for the sort dropdown
  const sortSelector = searchContainer.querySelector('.ons-input--sort-select');
  if (sortSelector) {
    sortSelector.addEventListener('change', async (e) => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort', e.target.value);
      switchSearchMarkup(url, true);

      // Google Tag Manager
      gtmDataLayerPush({
        event: 'SortBy',
        'sort-by': e.target.value,
      });
    });
  }

  // create listeners for the pagination
  const initPaginationListeners = () => {
    const paginationItems = searchContainer.querySelectorAll(
      '.ons-pagination__item a[data-target-page]',
    );
    if (paginationItems) {
      paginationItems.forEach((item) => {
        item.addEventListener('click', async (e) => {
          e.preventDefault();
          const url = new URL(window.location.href);
          const { targetPage } = e.target.dataset;
          if (!targetPage) return;
          url.searchParams.set('page', targetPage);
          switchSearchMarkup(url, false, true);
        });
      });
    }
  };

  initPaginationListeners();

  // filter menu for mobile if the page is running javascript let's make the filter menus
  // togglable and full-screen when displayed
  const toggleBtns = [
    ...searchContainer.querySelectorAll(
      '.search__filter__mobile-filter-toggle',
    ),
  ];
  const filterMenu = searchContainer.querySelector('#search-filter');
  if (filterMenu) {
    filterMenu.classList.add('js-fullscreen-filter-menu-content', 'hide--sm');
    toggleBtns.forEach((btn) => {
      btn.classList.remove('hide');
      btn.addEventListener('click', () => {
        if (filterMenu.classList.contains('hide--sm')) {
          filterMenu.classList.remove('hide--sm');
        } else {
          filterMenu.classList.add('hide--sm');
        }
      });
    });
  }

  // capture focus in checkboxes
  const showResultsBtn = document.getElementById('show-results');
  const focusableElmnts = document.querySelectorAll('input[type="checkbox"]:not([disabled]), #clear-search');
  const firstFocusableElmnt = focusableElmnts[0];

  if (showResultsBtn) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (document.activeElement === showResultsBtn) {
          firstFocusableElmnt.focus();
          e.preventDefault();
        }
      }
    });

    // tab to checkboxes after filtering results
    const filterBtn = document.getElementById('filter-results');
    if (filterBtn) {
      document.addEventListener('click', () => {
        if (document.activeElement === filterBtn) {
          firstFocusableElmnt.focus();
        }
      });
    }
  }
}
