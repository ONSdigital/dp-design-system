import { fetchHtml, replaceWithIEPolyfill } from '../../utilities';

const scrollToTopOfSearch = (searchContainer) => {
  // scroll to the top of the page after the content has been refreshed, to indicate a change
  // has occurred
  let searchResultsSection = searchContainer.querySelector(
    '.search__count h2',
  );
  if (!searchResultsSection) {
    searchResultsSection = searchContainer.querySelector(
      '.search__results',
    );
  }
  const resultsSectionOffsetFromTop = searchResultsSection.getBoundingClientRect().top
    + document.documentElement.scrollTop;
  window.scrollTo(0, resultsSectionOffsetFromTop);
};

export const switchSearchMarkup = async (
  searchContainer,
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
    if (scrollToTop) scrollToTopOfSearch(searchContainer);
  }, 500);

  const responseText = await fetchHtml(url);
  clearTimeout(timer);

  if (scrollToTop) scrollToTopOfSearch(searchContainer);

  if (!responseText) {
    const pTag = resultsLoader.querySelector('p');
    if (pTag) pTag.innerText = pTag.dataset.errorMessage;
  } else {
    const fetchedDom = new DOMParser().parseFromString(responseText, 'text/html');

    let resultsCount = 0;
    const searchPrompt = fetchedDom.querySelector('.search__form--no-results');
    if (!searchPrompt) {
      resultsCount = parseInt(fetchedDom.querySelector('.search__summary__count')?.innerText, 10);
    }

    const noResultsMessage = document.querySelector('#results-zero');

    if (resultsCount === 0) {
      if (noResultsMessage) {
        noResultsMessage.classList.remove('hide');
      }
      const resultsList = searchContainer.querySelector('#results > ul');
      resultsList.innerHTML = '';
      const pagination = searchContainer.querySelector('.search__pagination');
      if (pagination) {
        pagination.innerHTML = '';
      }
      const resultsCountContainer = searchContainer.querySelector('.search__summary__count');
      resultsCountContainer.innerText = '0';
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

      // The parent function is called after a fetch
      // Required to reattach event listeners to new DOM elements
      // eslint-disable-next-line no-use-before-define
      initPaginationListeners(searchContainer);
    }

    replaceWithIEPolyfill(
      searchContainer.querySelector('.search__rss-link'),
      fetchedDom.querySelector('.search__rss-link'),
    );
  }

  // update the address bar
  window.history.pushState(null, '', decodeURIComponent(url));
};

// create listeners for the pagination
export const initPaginationListeners = (searchContainer) => {
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
        switchSearchMarkup(searchContainer, url, false, true);
      });
    });
  }
};

export const switchContentTypeFilterCheckbox = (paramsArray, searchContainer) => {
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
  switchSearchMarkup(searchContainer, url, true);
};

export const switchTopicFilterCheckbox = (paramsArray, searchContainer) => {
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
  switchSearchMarkup(searchContainer, url, true);
};
