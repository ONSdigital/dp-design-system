// Form validation utility helpers that assist users to [correct errors](https://service-manual.ons.gov.uk/design-system/patterns/correct-errors)

// clearValidation is a helper function that removes existing form validation
export const clearValidation = (formId, errSummaryContainerId, pageTitle) => {
  const panels = document.querySelectorAll(`#${formId} .ons-panel--error`);
  panels?.forEach((panel) => {
    const label = panel.querySelector('label');
    const input =
      panel.querySelector('input') || panel.querySelector('textarea');
    input?.classList?.remove('ons-input--error');
    panel.parentNode.replaceChildren(label, input);
  });
  const summary = document.querySelector(
    `#${errSummaryContainerId} .ons-panel--error`
  );
  summary?.remove();
  document.title = pageTitle;
};

// validateFields takes an array of input fields to validate
export const validateFields = (fields) => {
  let errors = [];
  fields.forEach((field) => setFieldValidation(field, errors));
  return errors;
};

// setFormValidation is a helper function that sets the page title and error summary for the form validation
export const setFormValidation = (pageTitle, validationErrs, form) => {
  document.title = `Error: ${pageTitle}`;
  const errorSummary = getErrorSummary(validationErrs);
  form.insertAdjacentHTML('afterbegin', errorSummary);
  const validationPanel = document.querySelector('#form-validation-panel');
  validationPanel?.focus();
};

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

// getValidationErrText is a helper function that accepts the validityState and dataset objects and will iterate over both to return the appropriate human friendly error message
function getValidationErrText(validityState, dataset) {
  for (const validKey in validityState) {
    if (validityState[validKey]) {
      const datasetKey = Object.keys(dataset).filter((key) => key === validKey);
      return dataset[datasetKey]
        ? dataset[datasetKey]
        : 'Input field is invalid';
    }
  }
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

// getErrorSummary is a helper function that builds the html required for the error summary
function getErrorSummary(errors) {
  const header =
    errors.length > 1
      ? `There are ${errors.length} problems with your answer`
      : 'There is a problem with your answer';
  let detail = '';
  errors.forEach((error) => {
    detail += `<li class="ons-list__item">
        <a href="${error.url}" class="ons-list__link ons-js-inpagelink">
          ${error.message}
        </a>
      </li>`;
  });
  const detailContainer =
    errors.length > 1
      ? `<ol class="ons-list">${detail}</ol>`
      : `<p><a href="${errors[0].url}" class="ons-list__link ons-js-inpagelink">
          ${errors[0].message}
        </a></p>`;

  return `<div aria-labelledby="alert" role="alert" tabindex="-1" id="form-validation-panel" class="ons-panel ons-panel--error ons-u-mb-m">
      <div class="ons-panel__header">
        <h2 id="alert" class="ons-panel__title ons-u-fs-r--b">${header}
        </h2>
      </div>
      <div class="ons-panel__body">
        ${detailContainer}
      </div>
    </div>`;
}

class ValidationError {
  constructor(message, url) {
    this.message = message;
    this.url = url;
  }
}
