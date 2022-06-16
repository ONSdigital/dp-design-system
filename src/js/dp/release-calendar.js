import { findNode, gtmDataLayerPush, days } from "../utilities";

const releaseCalendarContainer = document.querySelector(".release-calendar");

document.addEventListener("DOMContentLoaded", function () {
  function releaseTypeAutoSubmit(formSelector) {
    function onChangeHandler(event) {
      if (
        event.target.nodeName === "INPUT" &&
        event.target.classList.contains("ons-radio__input")
      ) {
        event.target.form.submit();
      }
    }

    const nodeReleaseTypeForm = findNode(formSelector);
    if (!nodeReleaseTypeForm) {
      console.warn("releaseTypeAutoSubmit() No form found");
      return;
    }

    const nodeRadioSet = findNode(
      nodeReleaseTypeForm,
      ":scope .ons-radios__items"
    );
    if (!nodeRadioSet) {
      console.warn("releaseTypeAutoSubmit() No radio set found");
      return;
    }

    nodeRadioSet.addEventListener("change", onChangeHandler);
  }

  if (findNode(".release-calendar")) {
    releaseTypeAutoSubmit(".release-calendar__filters .filters__release-type");
  }
});

const sortSelector = document.querySelector(".ons-input--select");
if (sortSelector) {
  sortSelector.addEventListener("change", async (e) => {
    gtmDataLayerPush({
      event: "SortBy",
      "sort-by": e.target.value,
    });
  });
}

[
  ...releaseCalendarContainer.querySelectorAll(
    ".ons-radio__input[type=radio]:not(input:disabled)"
  ),
].map((topFilter) => {
  topFilter.addEventListener("change", async (e) => {
    gtmDataLayerPush({
      event: "Filter",
      "filter-by": e.target.name,
      selected: e.target.value.replace("type-", ""),
    });
  });
});

document.querySelector('[aria-label="Keywords"]').onsubmit = async (e) => {
  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);
  gtmDataLayerPush({
    event: "Filter",
    "filter-by": "search",
    "search-term": formProps.keywords,
  });
};

document.querySelector('[aria-label="Released date"]').onsubmit = async (e) => {
  const formData = new FormData(e.target);
  const formProps = Object.fromEntries(formData);
  const startDate = `${formProps["after-year"]}/${formProps["after-month"]}/${formProps["after-day"]}`;
  const endDate = `${formProps["before-year"]}/${formProps["before-month"]}/${formProps["before-day"]}`;

  const numberOfDays = days(
    new Date(
      formProps["after-year"],
      formProps["after-month"],
      formProps["after-day"]
    ),
    new Date(
      formProps["before-year"],
      formProps["before-month"],
      formProps["before-day"]
    )
  );

  gtmDataLayerPush({
    event: "Filter",
    "filter-by": "date-range",
    "start-date": startDate,
    "end-date": endDate,
    "number-of-days": numberOfDays,
  });
};
