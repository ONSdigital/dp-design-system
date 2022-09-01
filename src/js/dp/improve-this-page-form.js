document.addEventListener("DOMContentLoaded", function () {
  const pageURL = window.location.href;
  const feedbackURL = "/feedback";
  const positiveFeedbackPath = `${feedbackURL}/positive`;
  const feedbackThanks = document.querySelector(".feedback-thanks");

  const feedbackMessage =
    '<span id="feedback-form-confirmation">Thank you. Your feedback will help us as we continue to improve the service.</span>';
  const feedbackMessageError =
    '<span id="feedback-form-error role="alert"">Something went wrong, try using our <a href="/feedback">feedback form</a>.</span>';

  const feedbackFormURL = document.querySelector("#feedback-form-url");
  if (feedbackFormURL) {
    feedbackFormURL.value = pageURL;
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

      const { request, serializedData } = initFeedbackRequestHandler(feedbackFormContainer, feedbackURL, feedbackMessageError, feedbackThanks);

      request.send(serializedData);
    });
  }
});

function initFeedbackRequestHandler(form, path, feedbackMessageError, feedbackThanks) {
  const serializedData = serializeFormData(form);
  const request = new XMLHttpRequest();
  request.open("POST", path, true);
  console.log(request)
  request.setRequestHeader(
    "Content-Type",
    "application/x-www-form-urlencoded; charset=UTF-8",
  );
  request.send();
  console.log(request)
  request.onreadystatechange = function () {
    console.log(request)
    if (request.readyState === XMLHttpRequest.DONE) {
      const status = request.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        document.querySelector("#feedback-form-container").remove();
        feedbackThanks.innerHTML = "Thank you";
        var displayURL = document.referrer;
        var len = displayURL.length;
        if (len > 50) {
        displayURL = "..." + displayURL.slice(len - 50, len);
        }
        document.querySelector("#feedback-description").html("<div class=\"font-size--16\"><br>Your feedback will help us to improve the website. We are unable to respond to all enquiries. If your matter is urgent, please <a href=\"/aboutus/contactus\">contact us</a>.<br><br>Return to <a class=\"underline-link\" href=\"" + document.referrer + "\">" + displayURL + "</a></div>")
    } else {
      console.error(
          `footer feedback error: ${request.status}: ${request.statusText}`
      )
  }
  return { request, serializedData };
}}}

function serializeFormData(form) {
  const data = new FormData(form);
  const serializedData = new URLSearchParams(data).toString();
  return serializedData;
}
