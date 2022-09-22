document.addEventListener("DOMContentLoaded", function () {
    const feedbackFormContainer = document.querySelector(
        "#feedback-form-page-container"
    );

    if (feedbackFormContainer) {
        const pageURL = document.referrer;
        const feedbackURL = "/feedback";
        const feedbackFormURL = document.querySelector("#feedback-form-url");
        if (feedbackFormURL) {
            feedbackFormURL.value = pageURL;
        }
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
                    const feedbackDescriptionParent = document.querySelector("#feedback-description-field")
                    feedbackDescriptionParent.insertBefore(descriptionError, descriptionField);
                }
                descriptionField.classList.add("feedback-form-control__error");
                descriptionField.focus();
                hasErrors = true;
            }

            if (emailField && emailField.value !== "") {
                const emailError = document.createElement("span");
                emailError.className = "feedback-form-error"
                emailError.setAttribute('role', "alert")
                emailError.textContent = "This is not a valid email address, correct it or delete it."
                if (hasErrors) {
                    emailError
                } else {
                    emailError
                }

                const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/g;
                if (!emailRegex.test(emailField.value)) {
                    if (!document.querySelector("#email-field-label .feedback-form-error")) {
                        const emailParent = document.querySelector("#reply-request")
                        emailParent.insertBefore(emailError, emailField);
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

            const fetchConfig = {
                method: "POST",
                body: serializeFormData(feedbackFormContainer),
                headers: new Headers({
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                })
            };
            return fetch(feedbackURL, fetchConfig)
                .then(response => {
                    if (!response.ok) {
                        throw response;
                    } else {
                        document.querySelector("#feedback-form-page-container").remove();
                        const feedbackThanks = document.querySelector(".feedback-thanks")
                        feedbackThanks.innerHTML = "Thank you";
                        let displayURL = document.referrer;
                        if ((displayURL === feedbackURL) || (displayURL === "")) {
                            displayURL = "https://www.ons.gov.uk/";
                        };
                        let len = displayURL.length;
                        if (len > 50) {
                            displayURL = "..." + displayURL.slice(len - 50, len);
                        }
                        const feedbackDescription = document.querySelector("#feedback-description");
                        let feedbackSuccess = "<div class=\"font-size--16\" aria-live=\"polite\"><br>Your feedback will help us to improve the website. We are unable to respond to all enquiries. If your matter is urgent, please <a href=\"/aboutus/contactus\">contact us</a>.<br><br>Return to <a class=\"underline-link\" href=\"" + displayURL + "\">" + displayURL + "</a></div>";
                        feedbackDescription.innerHTML = feedbackSuccess;
                    }
                    return response.text();
                })
                .then(response => {
                    return response;
                })
                .catch(error => {
                    console.error(error);
                    return Promise.reject(error);
                });
        });
    }
});

function serializeFormData(form) {
    const data = new FormData(form);
    const serializedData = new URLSearchParams(data).toString();
    return serializedData;
}
//href=\"" + document.referrer + "\">" + displayURL + "</a>