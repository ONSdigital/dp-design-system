import { gtmDataLayerPush } from '../../utilities';
import { switchSearchMarkup, switchContentTypeFilterCheckbox, switchTopicFilterCheckbox } from './_helpers';
import {
  clearValidation, validateDateFieldset, setFormValidation, validateDateRange,
} from '../validation/validation';

const searchContainer = document.querySelector('.search__container');
const { title } = document;

export const contentTypeCheckboxHandler = () => {
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
      switchContentTypeFilterCheckbox(paramsArray, searchContainer);

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
        ], searchContainer);
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
};

export const topicFilterCheckboxHandler = () => {
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
      switchTopicFilterCheckbox(paramsArray, searchContainer);

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
        ], searchContainer);
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
};

export const sortHandler = () => {
  const sortSelector = searchContainer.querySelector('.ons-input--sort-select');
  if (sortSelector) {
    sortSelector.addEventListener('change', async (e) => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort', e.target.value);
      switchSearchMarkup(searchContainer, url, true);

      // Google Tag Manager
      gtmDataLayerPush({
        event: 'SortBy',
        'sort-by': e.target.value,
      });
    });
  }
};

export const mobileViewFilterHandler = () => {
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
};

export const queryStringHandler = (paramsArray) => {
  // get current param
  const url = new URL(window.location.href);

  // build new param
  paramsArray.forEach((param) => {
    if (param && param.query) {
      url.searchParams.set('q', param.query);
    } else {
      url.searchParams.delete('q');
    }
  });

  // make the change to the markup
  switchSearchMarkup(searchContainer, url, true);
};

export function keywordSearchHandler() {
  [
    ...searchContainer.querySelectorAll(
      '#keywords',
    ),
  ].forEach((topFilter) => {
    const theChildren = [
      searchContainer.querySelector(
        '#keywords',
      ),
    ];
    topFilter.addEventListener('input', async () => {
      const paramsArray = theChildren.map((item) => ({
        query: item.value,
      }));
      queryStringHandler(paramsArray);
    });
  });
}

export function dateValidationHandler() {
  const filterForm = searchContainer.querySelector('#filterForm');
  if (filterForm) {
    if (!searchContainer.querySelector('#after-date') || !searchContainer.querySelector('#before-date')) {
      return;
    }

    filterForm.onsubmit = (e) => {
      e.preventDefault();
      clearValidation('filterForm', 'search__container', title);
      // timeseries has a different container ID
      clearValidation('filterForm', 'timeSeriesContainer', title);

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
}
