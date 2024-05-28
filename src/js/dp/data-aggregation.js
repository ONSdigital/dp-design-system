import { fetchHtml, replaceWithIEPolyfill } from '../utilities';
import {
  clearValidation, validateDateFieldset, setFormValidation, validateDateRange,
} from './validation/validation';

const searchContainer = document.querySelector('.search__container');
const { title } = document;

if (searchContainer) {
  const scrollToTopOfSearch = () => {
    // scroll to the top of the page after the content has been refreshed
    // to indicate a change has occurred
    const searchResultsSection = searchContainer.querySelector(
      "[aria-label='Search results']",
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
      * in the case where it"s page one, remove page from searchParams.
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
        const searchPagination = searchContainer.querySelector('.search__pagination');
        if (searchPagination) {
          searchPagination.innerHTML = '';
        }
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

        replaceWithIEPolyfill(
          searchContainer.querySelector('.search__rss-link'),
          fetchedDom.querySelector('.search__rss-link'),
        );
      }
    }

    // update the address bar
    window.history.pushState(null, '', decodeURIComponent(url));
  };

  const switchQuery = (paramsArray) => {
    // get current param
    const url = new URL(window.location.href);

    // build new param
    paramsArray.forEach((param) => {
      if (param && param.query) {
        if (!url.searchParams.get('q')) {
          url.searchParams.append('q', param.query);
        } else {
          url.searchParams.set('q', param.query);
        }
      } else {
        url.searchParams.delete('q');
      }
    });

    // make the change to the markup
    switchSearchMarkup(url, true);
  };

  const switchDate = (paramsArray, forAfterParams = true, forBeforeParams = true) => {
    // get current param
    const url = new URL(window.location.href);

    const afterKeyQueryArray = [
      {
        key: 'afterYear',
        queryKey: 'after-year',
      },
      {
        key: 'afterMonth',
        queryKey: 'after-month',
      },
      {
        key: 'afterDay',
        queryKey: 'after-day',
      },
    ];

    const beforeKeyQueryArray = [
      {
        key: 'beforeYear',
        queryKey: 'before-year',
      },
      {
        key: 'beforeMonth',
        queryKey: 'before-month',
      },
      {
        key: 'beforeDay',
        queryKey: 'before-day',
      },
    ];

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
    };

    paramsArray.forEach((param) => {
      if (forBeforeParams) {
        beforeKeyQueryArray.forEach((element) => {
          addOrRemoveParam(param, element);
        });
      }
      if (forAfterParams) {
        afterKeyQueryArray.forEach((element) => {
          addOrRemoveParam(param, element);
        });
      }
    });

    // make the change to the markup
    switchSearchMarkup(url, true);
  };

  // create listeners for the keywords input
  [
    ...searchContainer.querySelectorAll(
      '#keywords',
    ),
  ].forEach((topFilter) => {
    // const childrenSelector = topFilter.getAttribute("aria-controls");
    const theChildren = [
      searchContainer.querySelector(
        '#keywords',
      ),
    ];
    topFilter.addEventListener('input', async () => {
      const paramsArray = theChildren.map((item) => ({
        query: item.value,
      }));
      switchQuery(paramsArray);
    });
  });

  // a method to validate and raise errors for the date inputs
  const validateDates = (datesArray) => {
    let validationError = false;

    // validate released after params
    if (datesArray.afterDay && (datesArray.afterDay > 31 || datesArray.afterDay < 1)) {
      validationError = true;
    }
    if (datesArray.afterMonth && (datesArray.afterMonth > 12 || datesArray.afterMonth < 1)) {
      validationError = true;
    }
    if (datesArray.afterYear && datesArray.afterYear < 1900) {
      validationError = true;
    }

    // validate released before params
    if (datesArray.beforeDay && (datesArray.beforeDay > 31 || datesArray.beforeDay < 1)) {
      validationError = true;
    }
    if (datesArray.beforeMonth && (datesArray.beforeMonth > 12 || datesArray.beforeMonth < 1)) {
      validationError = true;
    }
    if (datesArray.beforeYear && datesArray.beforeYear < 1900) {
      validationError = true;
    }

    return !validationError;
  };

  // create listeners for the to-date filter inputs
  [
    ...searchContainer.querySelectorAll(
      '#to-date-filters',
    ),
  ].forEach((topFilter) => {
    const toYear = searchContainer.querySelector('#to-date-filters-year');
    const toMonth = searchContainer.querySelector('#to-date-filters-month');
    const toDay = searchContainer.querySelector('#to-date-filters-day');
    topFilter.addEventListener('input', async () => {
      const beforeParamsArray = [
        {
          beforeYear: toYear.value,
          beforeMonth: toMonth.value,
          beforeDay: toDay.value,
        },
      ];

      if (toYear.value.length > 3) {
        if ((toYear.value.length > 0 && toMonth.value.length > 0 && toDay.value.length > 0)) {
          if (validateDates(beforeParamsArray[0])) {
            switchDate(beforeParamsArray, false, true);
          }
        }
      }

      if (toDay.value.length === 0 && toMonth.value.length === 0 && toYear.value.length === 0) {
        switchDate([
          {
            beforeYear: 0,
            beforeMonth: 0,
            beforeDay: 0,
          },
        ], false, true);
      }
    });
  });

  // create listeners for the from-date filter inputs
  [
    ...searchContainer.querySelectorAll(
      '#from-date-filters',
    ),
  ].forEach((topFilter) => {
    const fromYear = searchContainer.querySelector('#from-date-filters-year');
    const fromMonth = searchContainer.querySelector('#from-date-filters-month');
    const fromDay = searchContainer.querySelector('#from-date-filters-day');
    topFilter.addEventListener('input', async () => {
      const afterParamsArray = [
        {
          afterYear: fromYear.value,
          afterMonth: fromMonth.value,
          afterDay: fromDay.value,
        },
      ];

      if (fromYear.value.length > 3) {
        if ((fromYear.value.length > 0
          && fromMonth.value.length > 0 && fromDay.value.length > 0)) {
          if (validateDates(afterParamsArray[0])) {
            switchDate(afterParamsArray, true, false);
          }
        }
      }

      if (fromDay.value.length === 0
        && fromMonth.value.length === 0 && fromYear.value.length === 0) {
        switchDate([
          {
            afterYear: 0,
            afterMonth: 0,
            afterDay: 0,
          },
        ], true, false);
      }
    });
  });

  // create listeners for the last updated filter select
  [
    ...searchContainer.querySelectorAll(
      '#lastUpdatedSelect',
    ),
  ].forEach((topFilter) => {
    async function handleFilterChange() {
      const element = document.getElementById('dateFilters');
      if (topFilter.value === 'custom') {
        if (element.classList.contains('hidden')) {
          element.classList.remove('hidden');
        }
      } else {
        if (!element.classList.contains('hidden')) {
          element.classList.add('hidden');
        }

        const dateToday = new Date();

        let fromDay; let fromMonth; let fromYear; let toDay; let toMonth; let
          toYear;

        switch (topFilter.value) {
          case 'today': {
            fromDay = dateToday.getDate();
            fromMonth = dateToday.getMonth() + 1;
            fromYear = dateToday.getFullYear();
            const dateTomorrow = new Date(dateToday);
            dateTomorrow.setDate(dateTomorrow.getDate() + 1);
            toDay = dateTomorrow.getDate();
            toMonth = dateTomorrow.getMonth() + 1;
            toYear = dateTomorrow.getFullYear();
            break;
          }
          case 'week': {
            toDay = dateToday.getDate();
            toMonth = dateToday.getMonth() + 1;
            toYear = dateToday.getFullYear();
            const dateLastWeek = new Date(dateToday);
            dateLastWeek.setDate(dateLastWeek.getDate() - 7);
            fromDay = dateLastWeek.getDate();
            fromMonth = dateLastWeek.getMonth() + 1;
            fromYear = dateLastWeek.getFullYear();
            break;
          }
          case 'month': {
            toDay = dateToday.getDate();
            toMonth = dateToday.getMonth() + 1;
            toYear = dateToday.getFullYear();
            const dateLastMonth = new Date(dateToday);
            dateLastMonth.setMonth(dateLastMonth.getMonth());
            fromDay = dateLastMonth.getDate();
            fromMonth = dateLastMonth.getMonth();
            fromYear = dateLastMonth.getFullYear();
            break;
          }
          default:

            break;
        }
        if (fromYear) {
          const paramsArray = [
            {
              afterYear: fromYear,
              afterMonth: fromMonth,
              afterDay: fromDay,
              beforeYear: toYear,
              beforeMonth: toMonth,
              beforeDay: toDay,
            },
          ];
          switchDate(paramsArray);
        }
      }
    }

    topFilter.addEventListener('input', () => handleFilterChange(topFilter));
    handleFilterChange(topFilter);
  });

  searchContainer.querySelector('#filterForm').onsubmit = (e) => {
    e.preventDefault();
    clearValidation('filterForm', 'search__container', title);

    const beforeDateErrs = validateDateFieldset('#after-date');
    const afterDateErrs = validateDateFieldset('#before-date');
    if (beforeDateErrs.length > 0 || afterDateErrs.length > 0) {
      const validationErrs = [...beforeDateErrs, ...afterDateErrs];
      setFormValidation(title, validationErrs, searchContainer, true);
      return;
    }
    const dateRangeErrs = validateDateRange('#after-date', '#before-date');
    if (dateRangeErrs.length > 0) {
      setFormValidation(title, dateRangeErrs, searchContainer, true);
      return;
    }

    e.target.submit();
  };
}
