import { findNode, gtmDataLayerPush, days } from "../utilities";

const releaseCalendarContainer = document.querySelector(".release-calendar");
const releasePageContainer = document.querySelector(".release");

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

if (releaseCalendarContainer) {
  const sortSelector = document.querySelector(".ons-input--select");
  if (sortSelector) {
    sortSelector.addEventListener("change", (e) => {
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
    topFilter.addEventListener("change", (e) => {
      gtmDataLayerPush({
        event: "Filter",
        "filter-by": e.target.name.toString(),
        selected: e.target.value.replace("type-", ""),
      });
    });
  });

  document.querySelector(".release-calender-search-keyword").onsubmit = (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    gtmDataLayerPush({
      event: "Filter",
      "filter-by": "search",
      "search-term": formProps.keywords,
    });
  };

  document.querySelector(".release-calender-released-date").onsubmit = async (
    e
  ) => {
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
}

if (releasePageContainer) {
  const releaseStatus = releasePageContainer.dataset.gtmReleaseStatus;
  const releaseDate = new Date(releasePageContainer.dataset.gtmReleaseDate);
  const releaseTime = new Date(releasePageContainer.dataset.gtmReleaseTime);
  const releaseDateStatus = releasePageContainer.dataset.gtmReleaseDateStatus;
  const nextReleaseDate = new Date(
    releasePageContainer.dataset.gtmNextReleaseDate
  );
  const contactName = releasePageContainer.dataset.gtmContactName;

  const year = releaseDate.getFullYear().toString().padStart(2, "0");
  const month = releaseDate.getMonth().toString().padStart(2, "0");
  const date = releaseDate.getDate().toString().padStart(2, "0");
  const hour = releaseTime.getHours().toString().padStart(2, "0");
  const minutes = releaseTime.getMinutes().toString().padStart(2, "0");

  const nextReleaseYear = nextReleaseDate
    .getFullYear()
    .toString()
    .padStart(2, "0");
  const nextReleaseMonth = nextReleaseDate
    .getMonth()
    .toString()
    .padStart(2, "0");
  const nextReleaseDayDate = nextReleaseDate
    .getDate()
    .toString()
    .padStart(2, "0");

  gtmDataLayerPush({
    "release-status": releaseStatus,
    "release-date": `${year}${month}${date}`,
    "release-time": `${hour}:${minutes}`,
    "release-date-status": releaseDateStatus,
    "contact-name": contactName,
    "next-release-date": `${nextReleaseYear}${nextReleaseMonth}${nextReleaseDayDate}`,
  });
}
