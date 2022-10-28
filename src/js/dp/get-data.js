import { fetchHtml, replaceWithIEPollyfill, gtmDataLayerPush } from "../utilities";

document.addEventListener("DOMContentLoaded", function () {
  // Checking for downloads with loading spinner
  const getPage = async () => {
    const responseText = await fetchHtml(window.location.pathname);
    const dom = new DOMParser().parseFromString(responseText, "text/html");
    return dom.querySelector("[data-get-data-form-downloads=ready]");
  }
  const loadingSection = document.querySelector("[data-get-data-form-downloads=loading]");
  if (!!loadingSection) {
    let pollCount = 0;
    const pollForDownloads = setInterval(async () => {
      pollCount++;
      let downloadForm = await getPage();
      if(!!downloadForm) {
        const allRequiredFormats = downloadForm.querySelectorAll("input#csv, input#csvw, input#txt").length >= 3;
        if (!allRequiredFormats) return;
        clearTimeout(pollForDownloads);
        setTimeout(async () => {
          downloadForm = await getPage();
          replaceWithIEPollyfill(
            loadingSection,
            downloadForm
          );
        }, 2500)
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
