document.addEventListener("DOMContentLoaded", function () {
    const feedbackFormContainer = document.querySelector(
        "#feedback-form-page-container"
    );
    if (feedbackFormContainer) {
        const pageURL = window.location.href;
        const feedbackURL = "/feedback";
        feedbackFormContainer.addEventListener("submit", function (e) {
            e.preventDefault();
            const fieldErrors = document.querySelectorAll(
                "#feedback-form-page-container .feedback-form-control__error"
            );
            fieldErrors.forEach((fieldError) => {
                fieldError.classList.remove("feedback-form-control__error");
            });

            const formErrors = document.querySelectorAll(
                "#feedback-form-page-container .feedback-form-error"
            );
            formErrors.forEach((formError) => {
                formError.remove();
            });

            const emailField = document.querySelector("#email-field");
            const descriptionField = document.querySelector("#description-field");
            let hasErrors = false;

            if (descriptionField && descriptionField.value === "") {
                const descriptionError = document.createElement("span");
                descriptionError.className = "feedback-form-error";
                descriptionError.textContent = "Write some feedback";
                descriptionError.setAttribute('role', "alert");
                if (!document.querySelector("#description-field-label .feedback-form-error")) {
                    const descriptionFieldLabel = document.querySelector(
                        "#description-field-label"
                    );
                    const feedbackDescriptionParent = document.querySelector("#feedback-description-field")
                    feedbackDescriptionParent.insertBefore(descriptionError, descriptionField);
                }
                descriptionField.classList.add("feedback-form-control__error");
                descriptionField.focus();
                hasErrors = true;
            }

            if (emailField && emailField.value !== "") {
                let emailError = "";
                if (hasErrors) {
                    emailError =
                        '<span class="feedback-form-error" role="alert" aria-live="polite">This is not a valid email address, correct it or delete it</span>';
                } else {
                    emailError =
                        '<span class="feedback-form-error" role="alert">This is not a valid email address, correct it or delete it</span>';
                }

                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/g;
                if (!emailRegex.test(emailField.value)) {
                    if (!document.querySelector("#email-field-label .feedback-form-error")) {
                        const emailFieldLabel =
                            document.querySelector("#email-field-label");
                        emailFieldLabel.insertAdjacentHTML("beforeend", emailError);
                    }
                    emailField.classList.add("feedback-form-control__error");
                    hasErrors = true;
                }
            }

            if (hasErrors) {
                const feedbackButton = document.querySelector(".feedback-btn")
                feedbackButton.blur();
                return;
            }

            const { request, serializedData } = initFeedbackRequestHandler(feedbackFormContainer, feedbackURL);

            request.send(serializedData);
        });
    }
});

function initFeedbackRequestHandler(form, path, feedbackMessageError) {
    const serializedData = serializeFormData(form);
    const request = new XMLHttpRequest();
    request.open("POST", path, true);
    console.log(request)
    request.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=UTF-8",
    );
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            const status = request.status;
            if (status >= 200 && status < 400) {
                document.querySelector("#feedback-form-page-container").remove();
                const feedbackThanks = document.querySelector(".feedback-thanks")
                feedbackThanks.innerHTML = "Thank you";
                let displayURL = document.referrer;
                if (displayURL === "") {
                    displayURL = "www.ons.gov.uk";
                };
                let len = displayURL.length;
                if (len > 50) {
                    displayURL = "..." + displayURL.slice(len - 50, len);
                }
                const feedbackDescription = document.querySelector("#feedback-description");
                let feedbackSuccess = "<div class=\"font-size--16\" aria-live=\"polite\"><br>Your feedback will help us to improve the website. We are unable to respond to all enquiries. If your matter is urgent, please <a href=\"/aboutus/contactus\">contact us</a>.<br><br>Return to <a class=\"underline-link\" href=\"" + document.referrer + "\">" + displayURL + "</a></div>";
                feedbackDescription.innerHTML = feedbackSuccess;
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
