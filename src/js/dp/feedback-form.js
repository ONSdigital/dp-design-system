document.addEventListener("DOMContentLoaded", function () {
    const feedbackFormContainer = document.querySelector(
        "#feedback-form-page-container"
    );

    if (feedbackFormContainer) {
        const pageURL = document.referrer;
        const feedbackThanks = "/feedback/thanks"
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

            const returnToURL = document.querySelector("#page-url-field").value;
            const feedbackThanksURL = returnToURL ? feedbackThanks+"?returnTo="+returnToURL : feedbackThanks

            const fetchConfig = {
                method: "POST",
                body: serializeFormData(feedbackFormContainer),
                headers: new Headers({
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                })
            };
            return fetch(feedbackThanksURL, fetchConfig)
                .then(response => {
                    if (!response.ok) {
                        throw response;
                    } else {
                        window.location.href = feedbackThanksURL;
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
