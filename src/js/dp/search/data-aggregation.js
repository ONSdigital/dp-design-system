import { switchSearchMarkup } from './_helpers';
import {
  clearValidation, validateDateFieldset, setFormValidation, validateDateRange,
} from '../validation/validation';

const searchContainer = document.querySelector('.search__container');
const { title } = document;

if (searchContainer) {
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
    switchSearchMarkup(searchContainer, url, true);
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

  const filterForm = searchContainer.querySelector('#filterForm');
  if (filterForm) {
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
