document.addEventListener("DOMContentLoaded", function () {
  const pageURL = window.location.href;
  const feedbackPath = "/feedback";
  const positiveFeedbackPath = `${feedbackPath}/thanks`;
  const feedbackFormHeader = document.querySelector("#feedback-form-header");
  const feedbackMessage =
    '<span id="feedback-form-confirmation">Thank you. Your feedback will help us as we continue to improve the service.</span>';
  const feedbackMessageError =
    '<span id="feedback-form-error role="alert"">Something went wrong, try using our <a href="/feedback">feedback form</a>.</span>';
  let feedbackPositive = false

  const useFeedbackAPI = document.querySelector("#feedback-api-enabled");
  const feedbackAPIURL = document.querySelector("#feedback-api-url");

  const feedbackFormURL = document.querySelector("#feedback-form-url");
  if (feedbackFormURL) {
    feedbackFormURL.value = pageURL;
  }

  const feedbackToggles = document.querySelectorAll("a.js-toggle");
  if (feedbackToggles) {
    feedbackToggles.forEach((toggle) => {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        const feedbackForm = document.querySelector("#feedback-form");
        if (feedbackForm) {
          feedbackForm.classList.toggle("js-hidden");
        }
        if (feedbackFormHeader) {
          feedbackFormHeader.classList.toggle("js-hidden");
        }
        const id = toggle.id;
        if (id !== "feedback-form-close") {
          const descriptionField = document.querySelector("#description-field");
          if (descriptionField) {
            descriptionField.focus();
          }
        }
      });
    });
  }

  const feedbackFormYes = document.querySelector("#feedback-form-yes");
  if (feedbackFormYes && feedbackFormHeader) {
    feedbackFormYes.addEventListener("click", function (e) {
      feedbackPositive = true
      e.preventDefault();
      const feedbackFormContainer = document.querySelector(
        "#feedback-form-container"
      );
      if(useFeedbackAPI && useFeedbackAPI.value && feedbackAPIURL ) {
        const postObject = {
          is_page_useful: true,
          is_general_feedback: false,
          ons_url: pageURL
        }
        const postJson = JSON.stringify(postObject);
        fetchFeedbackAPI(feedbackFormContainer, feedbackAPIURL.value, feedbackFormHeader, postJson, feedbackMessageError, feedbackMessage);
      } else {
        const { request, serializedData } = initFeedbackRequestHandler(feedbackFormContainer, positiveFeedbackPath, feedbackFormHeader, feedbackMessage, feedbackMessageError, feedbackPositive);
        feedbackFormHeader.innerHTML = feedbackMessage;
        request.send(serializedData);
        }
    });
  }

  const feedbackFormContainer = document.querySelector(
    "#feedback-form-container"
  );
  if (feedbackFormContainer) {
    feedbackFormContainer.addEventListener("submit", function (e) {
      e.preventDefault();
      const fieldErrors = document.querySelectorAll(
        "#feedback-form-container .form-control__error"
      );
      fieldErrors.forEach((fieldError) => {
        fieldError.classList.remove("form-control__error");
      });

      const formErrors = document.querySelectorAll(
        "#feedback-form-container .form-error"
      );
      formErrors.forEach((formError) => {
        formError.remove();
      });

      const emailField = document.querySelector("#email-field");
      const descriptionField = document.querySelector("#description-field");
      const nameField = document.querySelector("#name-field");

      let hasErrors = false;

      if (descriptionField && descriptionField.value === "") {
        const descriptionError =
          '<span class="form-error" role="alert">Write some feedback</span>';
        if (!document.querySelector("#description-field-label .form-error")) {
          const descriptionFieldLabel = document.querySelector(
            "#description-field-label"
          );
          descriptionFieldLabel.insertAdjacentHTML(
            "beforeend",
            descriptionError
          );
        }
        descriptionField.classList.add("form-control__error");
        hasErrors = true;
      }

      if (emailField && emailField.value !== "") {
        let emailError = "";
        if (hasErrors) {
          emailError =
            '<span class="form-error" role="alert" aria-live="polite">This is not a valid email address, correct it or delete it</span>';
        } else {
          emailError =
            '<span class="form-error" role="alert">This is not a valid email address, correct it or delete it</span>';
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/g;
        if (!emailRegex.test(emailField.value)) {
          if (!document.querySelector("#email-field-label .form-error")) {
            const emailFieldLabel =
              document.querySelector("#email-field-label");
            emailFieldLabel.insertAdjacentHTML("beforeend", emailError);
          }
          hasErrors = true;
        }
      }

      if (hasErrors) {
        return;
      }

      if(useFeedbackAPI && useFeedbackAPI.value && feedbackAPIURL) {
        const postObject = {
          is_page_useful: false,
          is_general_feedback: false,
          ons_url: pageURL,
          name: nameField.value,
          email_address: emailField.value
        }
        const postJson = JSON.stringify(postObject);
        fetchFeedbackAPI(feedbackFormContainer, feedbackAPIURL.value, feedbackFormHeader, postJson, feedbackMessageError, feedbackMessage);
      } else {
      const { request, serializedData } = initFeedbackRequestHandler(feedbackFormContainer, feedbackPath, feedbackFormHeader, feedbackMessage, feedbackMessageError, feedbackPositive);
      const feedbackForm = document.querySelector("#feedback-form");
      if (feedbackForm) {
        feedbackForm.classList.add("js-hidden");
      }
      request.send(serializedData);
      }
    });
  }
});

function initFeedbackRequestHandler(form, path, feedbackFormHeader, feedbackMessage, feedbackMessageError, feedbackPositive) {
  const serializedData = serializeFormData(form);
  const request = new XMLHttpRequest();
  request.open("POST", path, true);
  request.setRequestHeader(
    "Content-Type",
    "application/x-www-form-urlencoded; charset=UTF-8"
  );
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      const status = request.status;
      if (feedbackPositive) {
        return
      } else if (status === 0 || (status >= 200 && status < 400)) {
        feedbackFormHeader.innerHTML = feedbackMessage;
      } else {
        console.error(
          `footer feedback error: ${request.status}: ${request.statusText}`
        );
        feedbackFormHeader.innerHTML = feedbackMessageError;
      }
    }
  };
  return { request, serializedData };
}


function fetchFeedbackAPI(form, url, feedbackFormHeader, postJson, feedbackMessageError, feedbackMessage) {
  const fetchConfig = {
    method: "POST",
    body: postJson,
    headers: new Headers({
        "Content-Type": "application/json; charset=UTF-8"
    })
  }
    
  fetch(url, fetchConfig)
  .then(response => {
      if (!response.ok) {
          throw response;
      }
  })
  .then(response => { 
    feedbackFormHeader.innerHTML = feedbackMessage;
  })
  .catch(error => {
      console.error(error);
      feedbackFormHeader.innerHTML = feedbackMessageError;
  });
}

function serializeFormData(form) {
  const data = new FormData(form);
  const serializedData = new URLSearchParams(data).toString();
  return serializedData;
}
