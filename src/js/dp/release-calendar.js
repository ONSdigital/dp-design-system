import { findNode, gtmDataLayerPush, daysBetween } from '../utilities';
import {
  clearValidation, validateDateFieldset, setFormValidation, validateDateRange,
} from './validation/validation';

function addDateRangeToGTM(formProps) {
  const startDate = new Date(
    `${formProps['after-year']}/${formProps['after-month']}/${formProps['after-day']} UTC`,
  );
  const endDate = new Date(
    `${formProps['before-year']}/${formProps['before-month']}/${formProps['before-day']} UTC`,
  );
  const numberOfDays = daysBetween(startDate, endDate);
  const gtmObj = {
    event: 'Filter',
    'filter-by': 'date-range',
  };
  let pushToDataLayer = false;

  if (Date.parse(startDate)) {
    pushToDataLayer = true;
    gtmObj['start-date'] = startDate.toISOString().slice(0, 10);
  }
  if (Date.parse(endDate)) {
    pushToDataLayer = true;
    gtmObj['end-date'] = endDate.toISOString().slice(0, 10);
  }
  if (numberOfDays) {
    pushToDataLayer = true;
    gtmObj['number-of-days'] = numberOfDays;
  }

  if (pushToDataLayer) {
    gtmDataLayerPush(gtmObj);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const releaseCalendarContainer = document.querySelector('.release-calendar');
  const releasePageContainer = document.querySelector('.release');
  const { title } = document;

  function releaseTypeAutoSubmit(formSelector) {
    function onChangeHandler(event) {
      if (
        event.target.nodeName === 'INPUT'
        && event.target.classList.contains('ons-radio__input')
      ) {
        event.target.form.submit();
      }
    }

    const nodeReleaseTypeForm = findNode(formSelector);
    if (!nodeReleaseTypeForm) {
      console.warn('releaseTypeAutoSubmit() No form found');
      return;
    }

    const nodeRadioSet = findNode(
      nodeReleaseTypeForm,
      ':scope .ons-radios__items',
    );
    if (!nodeRadioSet) {
      console.warn('releaseTypeAutoSubmit() No radio set found');
      return;
    }

    nodeRadioSet.addEventListener('change', onChangeHandler);
  }

  function releaseTypeCensusAutoSubmit(formSelector) {
    function onChangeHandler(event) {
      if (
        event.target.nodeName === 'INPUT'
        && event.target.classList.contains('ons-checkbox__input')
      ) {
        event.target.form.submit();
      }
    }

    const nodeReleaseTypeCensusForm = findNode(formSelector);
    if (!nodeReleaseTypeCensusForm) {
      console.warn('releaseTypeCensusAutoSubmit() No form found');
      return;
    }

    const nodeCheckboxSet = findNode(
      nodeReleaseTypeCensusForm,
      ':scope .ons-checkboxes__items',
    );

    if (!nodeCheckboxSet) {
      console.warn('releaseTypeCensusAutoSubmit() No checkbox set found');
      return;
    }

    nodeCheckboxSet.addEventListener('change', onChangeHandler);
  }

  if (findNode('.release-calendar')) {
    releaseTypeAutoSubmit('.release-calendar__filters');
    releaseTypeCensusAutoSubmit('.release-calendar__filters');
  }
  if (releasePageContainer) {
    const releaseStatus = releasePageContainer.dataset.gtmReleaseStatus;
    const releaseDate = new Date(
      `${releasePageContainer.dataset.gtmReleaseDate} ${releasePageContainer.dataset.gtmReleaseTime}`,
    );
    const releaseDateStatus = releasePageContainer.dataset.gtmReleaseDateStatus;
    const nextReleaseDate = new Date(
      releasePageContainer.dataset.gtmNextReleaseDate,
    );
    const contactName = releasePageContainer.dataset.gtmContactName;

    const year = releaseDate.getFullYear().toString().padStart(2, '0');
    const month = (releaseDate.getMonth() + 1).toString().padStart(2, '0'); // getMonth is zero based
    const date = releaseDate.getDate().toString().padStart(2, '0');
    const hour = releaseDate.getHours().toString().padStart(2, '0');
    const minutes = releaseDate.getMinutes().toString().padStart(2, '0');

    const gtmObj = {
      'release-status': releaseStatus,
      'release-date': `${year}${month}${date}`,
      'release-time': `${hour}:${minutes}`,
      'release-date-status': releaseDateStatus,
      'contact-name': contactName,
    };

    if (Date.parse(nextReleaseDate)) {
      const nextReleaseYear = nextReleaseDate
        .getFullYear()
        .toString()
        .padStart(2, '0');
      const nextReleaseMonth = (nextReleaseDate.getMonth() + 1) // getMonth is zero based
        .toString()
        .padStart(2, '0');
      const nextReleaseDayDate = nextReleaseDate
        .getDate()
        .toString()
        .padStart(2, '0');

      gtmObj[
        'next-release-date'
      ] = `${nextReleaseYear}${nextReleaseMonth}${nextReleaseDayDate}`;
    }

    gtmDataLayerPush(gtmObj);
  }
  if (releaseCalendarContainer) {
    const sortSelector = document.querySelector('.ons-input--select');
    if (sortSelector) {
      sortSelector.addEventListener('change', (e) => {
        gtmDataLayerPush({
          event: 'SortBy',
          'sort-by': e.target.value,
        });
      });
    }

    [
      ...releaseCalendarContainer.querySelectorAll(
        '.ons-radio__input[type=radio]:not(input:disabled)',
      ),
    ].map((topFilter) => topFilter.addEventListener('change', (e) => {
      gtmDataLayerPush({
        event: 'Filter',
        'filter-by': e.target.name,
        selected: e.target.value.toString().replace('type-', ''),
      });
    }));

    document.querySelector('#release-calendar__filters').onsubmit = (e) => {
      e.preventDefault();
      clearValidation('release-calendar__filters', 'release-calendar', title);

      const beforeDateErrs = validateDateFieldset('#after-date');
      const afterDateErrs = validateDateFieldset('#before-date');
      if (beforeDateErrs.length > 0 || afterDateErrs.length > 0) {
        const validationErrs = [...beforeDateErrs, ...afterDateErrs];
        setFormValidation(title, validationErrs, releaseCalendarContainer, true);
        return;
      }
      const dateRangeErrs = validateDateRange('#after-date', '#before-date');
      if (dateRangeErrs.length > 0) {
        setFormValidation(title, dateRangeErrs, releaseCalendarContainer, true);
        return;
      }

      const formData = new FormData(e.target);
      const formProps = Object.fromEntries(formData);
      if (formProps.keywords) {
        gtmDataLayerPush({
          event: 'Filter',
          'filter-by': 'search',
          'search-term': formProps.keywords,
        });
      }
      addDateRangeToGTM(formProps);
      e.target.submit();
    };

    document
      .querySelector('#release-type-census')
      .addEventListener('change', () => {
        gtmDataLayerPush({
          event: 'Filter',
          'filter-by': 'census',
          selected: 'census',
        });
      });
  }
});
