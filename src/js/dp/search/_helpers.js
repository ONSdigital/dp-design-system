import { fetchHtml, replaceWithIEPolyfill } from '../../utilities';

const scrollToTopOfSearch = (searchContainer) => {
  // scroll to the top of the page after the content has been refreshed, to indicate a change
  // has occurred
  const searchResultsSection = searchContainer.querySelector(
    '.search__count h2',
  );
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
      resultsCount = parseInt(fetchedDom.querySelector('.search__summary__count').innerText, 10);
    }

    const noResultsMessage = document.querySelector('#results-zero');

    if (resultsCount === 0) {
      if (noResultsMessage) {
        noResultsMessage.classList.remove('hide');
      }
      const resultsList = searchContainer.querySelector('#results > ul');
      resultsList.innerHTML = '';
      const pagination = searchContainer.querySelector('.search__pagination');
      pagination.innerHTML = '';
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

      // TODO: this func or initPaginationListeners need breaking up to allow move
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
