// Form validation utility helpers that assist users to [correct errors](https://service-manual.ons.gov.uk/design-system/patterns/correct-errors)

class ValidationError {
  constructor(message, url) {
    this.message = message;
    this.url = url;
  }
}

// clearValidation is a helper function that removes existing form validation
export const clearValidation = (formId, errSummaryContainerId, pageTitle) => {
  const panels = document.querySelectorAll(`#${formId} .ons-panel--error`);
  panels?.forEach((panel) => {
    const fieldset = panel.querySelector('fieldset');
    if (fieldset) {
      fieldset.querySelectorAll('.ons-input--error').forEach((input) => input.classList.remove('ons-input--error'));
      panel.replaceWith(fieldset);
      return;
    }
    const label = panel.querySelector('label');
    const input = panel.querySelector('input') || panel.querySelector('textarea');
    input?.classList?.remove('ons-input--error');
    panel.parentNode.replaceChildren(label, input);
  });
  const summary = document.querySelector(
    `#${errSummaryContainerId} .ons-panel--error`,
  );
  summary?.remove();
  document.title = pageTitle;
};

// getValidationErrText is a helper function that accepts the validityState and dataset objects
// and will iterate over both to return the appropriate human friendly error message
function getValidationErrText(validityState, dataset) {
  // ValidityState cannot be accessed using Object.keys/values/entries
  // eslint-disable-next-line no-restricted-syntax
  for (const validKey in validityState) {
    if (validityState[validKey]) {
      const datasetKey = Object.keys(dataset).filter((key) => key === validKey);
      return dataset[datasetKey]
        ? dataset[datasetKey]
        : 'Input field is invalid';
    }
  }
  return false;
}

// getFieldErr is a helper function that builds the html required for a field validation error
function getFieldErr(errorMsg, labelNode, id) {
  return `<div
    class="ons-panel ons-panel--error ons-panel--no-title"
    id="${id}"
    >
    <span class="ons-u-vh">
        Error:
    </span>
    <div class="ons-panel__body">
        <p class="ons-panel__error">
            <strong>${errorMsg}</strong>
        </p>
        ${labelNode.parentNode.innerHTML}
        </div>
      </div>
      `;
}

// getFieldsetErr is a helper function that builds the html required for a fieldset validation error
function getFieldsetErr(errorMsg, fieldsetNode) {
  return `
    <span class="ons-u-vh">
      Error:
    </span>
    <div class="ons-panel__body">
        ${errorMsg}
        <fieldset 
          id="${fieldsetNode.id}"  
          class="ons-fieldset" 
          data-invalid-date="${fieldsetNode.dataset.invalidDate ?? ''}"
          data-invalid-range="${fieldsetNode.dataset.invalidRange ?? ''}"
        >
          ${fieldsetNode.innerHTML}
        </fieldset>
    </div>
  `;
}

// getErrorSummary is a helper function that builds the html required for the error summary
function getErrorSummary(errors, isPageError) {
  const errType = isPageError ? 'this page' : 'your answer';
  const header = errors.length > 1
    ? `There are ${errors.length} problems with ${errType}` : `There is a problem with ${errType}`;
  let detail = '';
  errors.forEach((error) => {
    detail += `<li class="ons-list__item">
        <a href="${error.url}" class="ons-list__link ons-js-inpagelink">
          ${error.message}
        </a>
      </li>`;
  });
  const detailContainer = errors.length > 1
    ? `<ol class="ons-list">${detail}</ol>`
    : `<p><a href="${errors[0].url}" class="ons-list__link ons-js-inpagelink">
          ${errors[0].message}
        </a></p>`;

  return `<div aria-labelledby="error-summary-title" role="alert" tabindex="-1" id="form-validation-panel" class="ons-panel ons-panel--error ons-u-mb-m ons-u-mt-m">
      <div class="ons-panel__header">
        <h2 id="error-summary-title" class="ons-panel__title ons-u-fs-r--b">${header}
        </h2>
      </div>
      <div class="ons-panel__body">
        ${detailContainer}
      </div>
    </div>`;
}

// setFieldValidation is a helper function that sets the validation on the field
function setFieldValidation(field, errors) {
  if (!field.validity.valid) {
    const errText = getValidationErrText(field.validity, field.dataset);
    const fieldLabel = field.previousElementSibling;
    const fieldErr = getFieldErr(errText, fieldLabel, `${field.id}-error`);
    if (!fieldLabel.parentNode.classList.contains('ons-panel__body')) {
      fieldLabel.parentNode.innerHTML = fieldErr;
      const newField = document.getElementById(field.id);
      newField.value = field.value;
      newField.classList.add('ons-input--error');
    }
    errors.push(new ValidationError(errText, `#${field.id}-error`));
  }
}

// isValidDate returns true if the date is valid e.g isValidDate('2024', '2' , '30') = false
function isValidDate(year, month, day) {
  const date = new Date(`${year}-${month}-${day}`);
  if (!Date.parse(date)) {
    return false;
  }
  const y = date.getFullYear().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0'); // month is zero indexed
  const d = date.getDate().toString().padStart(2, '0');

  return (y === year.padStart(2, '0') && m === month.padStart(2, '0') && d === day.padStart(2, '0'));
}

// setAssumedValues will check for day and month values and set them if not present
function setAssumedValues(day, month) {
  let tempDay = day;
  if (day === '') {
    tempDay = '01';
  }

  let tempMonth = month;
  if (month === '') {
    tempMonth = '01';
  }

  return [tempDay, tempMonth];
}

// getDateFields given a date fieldset will return the 'day', 'month' and 'year' nodes
function getDateFields(fieldsetNode) {
  const fields = fieldsetNode?.querySelectorAll('input[type=text]');
  const day = [...fields].find(({ id }) => id.includes('day'));
  const month = [...fields].find(({ id }) => id.includes('month'));
  const year = [...fields].find(({ id }) => id.includes('year'));
  return [day, month, year];
}

// setFieldsetValidation is a helper function that sets the validation on a fieldset
function setFieldsetValidation(fieldset, errors) {
  const fieldsetID = `#${fieldset?.id}`;
  const [day, month, year] = getDateFields(fieldset);

  if (day.value === '' && month.value === '' && year.value === '') {
    return errors;
  }

  const filteredFields = [day, month, year];
  filteredFields.forEach((field) => {
    if (field.validity.patternMismatch) {
      const errText = getValidationErrText(field.validity, field.dataset);
      errors.push(new ValidationError(errText, `${fieldsetID}-error`));
      field.classList.add('ons-input--error');
    }
  });

  if ((day.value !== '' || month.value !== '') && year.value === '') {
    const errText = year.dataset.valueMissing
      ? year.dataset.valueMissing
      : 'Year is required';
    errors.push(new ValidationError(errText, `${fieldsetID}-error`));
    year.classList.add('ons-input--error');
  }

  if (errors.length > 0) {
    return errors;
  }

  const [tempDay, tempMonth] = setAssumedValues(day.value, month.value);
  if (!isValidDate(year.value, tempMonth, tempDay)) {
    const errText = fieldset.dataset.invalidDate
      ? fieldset.dataset.invalidDate
      : 'Enter a real date';
    errors.push(new ValidationError(errText, `${fieldsetID}-error`));
    day.classList.add('ons-input--error');
    month.classList.add('ons-input--error');
    year.classList.add('ons-input--error');
  }

  return errors;
}

// getFieldsetErrorMarkup gets the html to display the inner error text for a validation error
function getFieldsetErrorMarkup(errors) {
  let errText = '';
  const len = errors.length;
  errors.forEach((err, i) => {
    errText
      += `<p class="ons-panel__error${i + 1 !== len ? ' ons-u-mb-no' : ''}">
        <strong>${err.message}</strong>
      </p>`;
  });
  return errText;
}

// getFieldsetErrorContainer wraps the error fieldset into a containing div element
function getFieldsetErrorContainer(fieldset, fieldsetError) {
  const errorContainer = document.createElement('div');
  errorContainer.classList.add('ons-panel', 'ons-panel--error', 'ons-panel--no-title');
  errorContainer.id = `${fieldset.id}-error`;
  errorContainer.innerHTML = fieldsetError;
  fieldset.querySelectorAll('input[type=text]').forEach((field) => {
    const newField = errorContainer.querySelector(`#${field.id}`);
    newField.value = field.value;
  });
  return errorContainer;
}

// setFormValidation is a helper function that sets the page title and error
// summary for the form validation
export const setFormValidation = (pageTitle, validationErrs, form, isPageError) => {
  document.title = `Error: ${pageTitle}`;
  const errorSummary = getErrorSummary(validationErrs, isPageError);
  form.insertAdjacentHTML('afterbegin', errorSummary);
  const validationPanel = document.querySelector('#form-validation-panel');
  validationPanel?.focus();
};

// validateFields takes an array of input fields to validate
export const validateFields = (fields) => {
  const errors = [];
  fields.forEach((field) => setFieldValidation(field, errors));
  return errors;
};

// validateDateFieldset takes a date fieldset element selector e.g. #start-date
export const validateDateFieldset = (fieldsetID) => {
  const errors = [];
  const fieldset = document.querySelector(fieldsetID);

  setFieldsetValidation(fieldset, errors);

  if (errors.length > 0) {
    const errText = getFieldsetErrorMarkup(errors);
    const fieldsetError = getFieldsetErr(errText, fieldset);
    const errorContainer = getFieldsetErrorContainer(fieldset, fieldsetError);
    fieldset.replaceWith(errorContainer);
  }

  return errors;
};

// validateDateRange takes two date fieldsets and will return an error
// if the 'to' date is before the 'from' date
export const validateDateRange = (fromID, toID) => {
  const errors = [];
  const from = document.querySelector(fromID);
  const to = document.querySelector(toID);
  const [fromDay, fromMonth, fromYear] = getDateFields(from);
  const [toDay, toMonth, toYear] = getDateFields(to);

  if (fromDay.value === '' && fromMonth.value === '' && fromYear.value === '') {
    return errors;
  }

  if (toDay.value === '' && toMonth.value === '' && toYear.value === '') {
    return errors;
  }

  const [tempFromDay, tempFromMonth] = setAssumedValues(fromDay.value, fromMonth.value);
  const [tempToDay, tempToMonth] = setAssumedValues(toDay.value, toMonth.value);

  if (!isValidDate(fromYear.value, tempFromMonth, tempFromDay)
    || !isValidDate(toYear.value, tempToMonth, tempToDay)) {
    console.warn('invalid dates passed to validateDateRange()');
  }

  const fromDate = new Date(`${fromYear.value}-${tempFromMonth}-${tempFromDay}`).getTime();
  const toDate = new Date(`${toYear.value}-${tempToMonth}-${tempToDay}`).getTime();

  if (toDate < fromDate) {
    let errText = to.dataset.invalidRange
      ? to.dataset.invalidRange
      : 'Enter an end date after the start date';
    errText = errText.concat(` ${fromYear.value}`);
    errors.push(new ValidationError(errText, `#${to.id}-error`));
    toYear.classList.add('ons-input--error');
    const errMarkup = getFieldsetErrorMarkup(errors);
    const fieldsetError = getFieldsetErr(errMarkup, to);
    const errorContainer = getFieldsetErrorContainer(to, fieldsetError);
    to.replaceWith(errorContainer);
  }

  return errors;
};
