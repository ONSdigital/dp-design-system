import { fetchHtml, replaceWithIEPolyfill } from '../utilities';

const searchContainer = document.querySelector('.search__container');

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
        key: 'afterDate',
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
        key: 'beforeDate',
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
    const releasedAfterContainer = document.querySelector('.inputs-released-after');
    const releasedBeforeContainer = document.querySelector('.inputs-released-before');
    const releaseAfterErrorElement = document.querySelector('.inputs-released-after-error');
    const releaseAfterErrorText = document.querySelector('.inputs-released-after-error-text');
    const releaseBeforeErrorElement = document.querySelector('.inputs-released-before-error');
    const releaseBeforeErrorText = document.querySelector('.inputs-released-before-error-text');
    const assistiveText = document.createElement('span');
    assistiveText.innerText = 'Error: ';
    assistiveText.classList.add('ons-panel__assistive-text', 'ons-u-vh');

    let validationError = false;

    const dayError = 'The day parameter has to be between 1 and 31';
    const monthError = 'The month parameter has to be between 1 and 12';
    const yearError = 'The year parameter has to be higher than 1900';

    const clearErrors = () => {
      if (releasedAfterContainer.classList.contains('ons-panel--error', 'ons-panel--no-title')) {
        releasedAfterContainer.classList.remove('ons-panel--error', 'ons-panel--no-title');
        releaseAfterErrorElement.classList.toggle('hidden');
        if (releasedAfterContainer.querySelector('.ons-panel__assistive-text')) {
          releasedAfterContainer.querySelector('.ons-panel__assistive-text').remove();
        }
      }
      if (releasedBeforeContainer.classList.contains('ons-panel--error', 'ons-panel--no-title')) {
        releasedBeforeContainer.classList.remove('ons-panel--error', 'ons-panel--no-title');
        releaseBeforeErrorElement.classList.toggle('hidden');
        if (releasedBeforeContainer.querySelector('.ons-panel__assistive-text')) {
          releasedBeforeContainer.querySelector('.ons-panel__assistive-text').remove();
        }
      }
    };

    const addError = (container, errorElement, errorTextElement, errorText) => {
      if (!container.classList.contains('ons-panel--error', 'ons-panel--no-title')) {
        container.classList.add('ons-panel--error', 'ons-panel--no-title');
        errorElement.classList.toggle('hidden');
        const errTxtElement = errorTextElement;
        errTxtElement.innerText = errorText;
        if (!container.contains(assistiveText)) {
          container.prepend(assistiveText);
        }
      }
    };

    // validate released after params
    if (datesArray.afterDate && (datesArray.afterDate > 31 || datesArray.afterDate < 1)) {
      addError(
        releasedAfterContainer,
        releaseAfterErrorElement,
        releaseAfterErrorText,
        dayError,
      );
      validationError = true;
    }
    if (datesArray.afterMonth && (datesArray.afterMonth > 12 || datesArray.afterMonth < 1)) {
      addError(
        releasedAfterContainer,
        releaseAfterErrorElement,
        releaseAfterErrorText,
        monthError,
      );
      validationError = true;
    }
    if (datesArray.afterYear && datesArray.afterYear < 1900) {
      addError(
        releasedAfterContainer,
        releaseAfterErrorElement,
        releaseAfterErrorText,
        yearError,
      );
      validationError = true;
    }

    // validate released before params
    if (datesArray.beforeDate && (datesArray.beforeDate > 31 || datesArray.beforeDate < 1)) {
      addError(
        releasedBeforeContainer,
        releaseBeforeErrorElement,
        releaseBeforeErrorText,
        dayError,
      );
      validationError = true;
    }
    if (datesArray.beforeMonth && (datesArray.beforeMonth > 12 || datesArray.beforeMonth < 1)) {
      addError(
        releasedBeforeContainer,
        releaseBeforeErrorElement,
        releaseBeforeErrorText,
        monthError,
      );
      validationError = true;
    }
    if (datesArray.beforeYear && datesArray.beforeYear < 1900) {
      addError(
        releasedBeforeContainer,
        releaseBeforeErrorElement,
        releaseBeforeErrorText,
        yearError,
      );
      validationError = true;
    }

    if (!validationError) {
      clearErrors();
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
            beforeDate: 0,
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
          afterDate: fromDay.value,
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
            afterDate: 0,
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
        const paramsArray = [
          {
            afterYear: fromYear,
            afterMonth: fromMonth,
            afterDate: fromDay,
            beforeYear: toYear,
            beforeMonth: toMonth,
            beforeDate: toDay,
          },
        ];
        switchDate(paramsArray);
      }
    }

    topFilter.addEventListener('input', () => handleFilterChange(topFilter));
    handleFilterChange(topFilter);
  });
}
