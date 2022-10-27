import { fetchHtml, replaceWithIEPollyfill, gtmDataLayerPush } from "../utilities";

document.addEventListener("DOMContentLoaded", function () {
  // Checking for downloads with loading spinner
  const loadingSection = document.querySelector("[data-get-data-form-downloads=loading]");  
  if (!!loadingSection) {
    let pollCount = 0;
    const pollForDownloads = setInterval(async () => {
      pollCount++;
      const responseText = await fetchHtml(window.location.pathname);
      const dom = new DOMParser().parseFromString(responseText, "text/html");
      const downloadForm = dom.querySelector("[data-get-data-form-downloads=ready]")
      if(!!downloadForm) {
        replaceWithIEPollyfill(
          loadingSection,
          downloadForm
        );
        clearTimeout(pollForDownloads);
      }
      if(pollCount > 60) clearTimeout(pollForDownloads);
    }, 500)
  }

  // Google Tag Manager
  const getDataForm = document.forms["get-data-form"];
  if (!!getDataForm) {
    getDataForm.addEventListener("submit", (e) => {
      const formData = new FormData(e.target);
      const format = formData.get("format");
      if (format != null) {
        gtmDataLayerPush({
          event: "fileDownload",
          fileExtension: format,
        });
      }
    });
  }
});
