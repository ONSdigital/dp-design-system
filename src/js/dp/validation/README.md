# Validation

How to instantiate client (JS) form validation within a frontend service.

:warning: JS validation is a progressive enhancement and should **never** replace server validation. :warning:

## Getting Started

1. Create a js file for your frontend app
1. Add an event listener on the submit event of the form you would like to validate

    ```javascript
    document.querySelector('#form_id').onsubmit = (e) => { ... }
    ```

1. Use the following functions in your form `onsubmit` event function

    ```javascript
    clearValidation('form_id', 'form_container_id', pageTitle);
    
    const validationErrs = validateFields([
        oneField,
        anotherField,
        andAnotherField,
    ]);
    
    if (validationErrs.length > 0) {
        setFormValidation(pageTitle, validationErrs, formNode);
        return;
    }
    ```

1. Full snippet of a basic implementation

    ```javascript
    document.querySelector('#form_id').onsubmit = (e) => { 
        e.preventDefault();
        
        clearValidation('form_id', 'form_container_id', pageTitle);
        
        const validationErrs = validateFields([
        oneField,
        anotherField,
        andAnotherField,
        ]);
        
        if (validationErrs.length > 0) {
            setFormValidation(pageTitle, validationErrs, formNode);
            return;
        }

        e.target.submit();
    }
    ```

### Variants

#### Validate date fieldset(s)

Use this function to validate a [date fieldset](https://service-manual.ons.gov.uk/design-system/patterns/dates#overview) that contains 'day', 'month' and 'year' input fields.

```javascript
const dateFieldset = validateDateFieldset('#date-id');
```

#### Validate date range

Given two validated date fieldsets, this function will check whether that the 'to' fieldset is after the 'from' fieldset and return a validation error if it is not

```javascript
const dateRangeErrs = validateDateRange('#from-date', '#to-date');
```

#### Custom validation messages

Use the `data` attribute within the input field to set a custom error

```html
<input 
    type="text" 
    id="day" 
    class="ons-input ons-input--text ons-input-type__input" 
    name="day"
    maxlength="2" 
    pattern="[0-9]*" 
    inputmode="numeric" 
    autocomplete="bday-day" 
    value="" 
    data-pattern-mismatch="Enter a number for day">
```

Will change the `patternMismatch` error message from "Input field is invalid" to "Enter a number for day"

##### Custom date range validation message

The error message sits on the 'to' field so the JS is expecting the error message to be in the parent of the date inputs i.e. the fieldset with the `invalidRange` key

```html
<fieldset 
    id="before-date" 
    class="ons-fieldset" 
    data-invalid-range="End year is later than the start year"
    >
    <SomeHTML>
</fieldset>
```

**Note** The JS will concatenate the error message string with the year value of the 'from' year at the end i.e. "End year is later than the start year 2023"

#### Error summary heading

Provide a `bool` at the end of `setFormValidation` params to toggle the wording from answer to page
</br>
e.g.
</br>

- There are x problems with your answer
- There are x problems with this page

```javascript
setFormValidation(title, validationErrs, formContainer, true);
```
