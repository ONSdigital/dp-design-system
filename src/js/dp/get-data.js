import {
  fetchHtml,
  replaceWithIEPolyfill,
  gtmDataLayerPush,
} from '../utilities';

document.addEventListener('DOMContentLoaded', () => {
  // Google Tag Manager
  function addAnalyticsToForm() {
    const getDataForm = document.forms['get-data-form'];
    if (getDataForm) {
      getDataForm.addEventListener('submit', (e) => {
        const formData = new FormData(e.target);
        const format = formData.get('format');
        if (format != null) {
          gtmDataLayerPush({
            event: 'fileDownload',
            fileExtension: format,
          });
        }
      });
    }
  }
  addAnalyticsToForm();

  // Checking for downloads with loading spinner
  const getPage = async () => {
    const responseText = await fetchHtml(
      `${window.location.pathname}?spinner=true`,
    );
    const dom = new DOMParser().parseFromString(responseText, 'text/html');
    return dom.querySelector('[data-get-data-form-downloads=ready]');
  };
  const loadingSection = document.querySelector(
    '[data-get-data-form-downloads=loading]',
  );
  if (loadingSection) {
    let pollCount = 0;
    const pollForDownloads = setInterval(async () => {
      pollCount += 1;
      let downloadForm = await getPage();
      if (downloadForm) {
        const allRequiredFormats = downloadForm.querySelectorAll('input#csv, input#csvw, input#txt')
          .length >= 3;
        if (!allRequiredFormats) return;
        clearTimeout(pollForDownloads);
        setTimeout(async () => {
          downloadForm = await getPage();
          replaceWithIEPolyfill(loadingSection, downloadForm);
          addAnalyticsToForm();
        }, 2500);
      }
      // Stop polling and remove spinner
      if (pollCount > 60) {
        clearTimeout(pollForDownloads);
        const spinner = loadingSection.querySelector(
          '.ons-loading-spinner--after',
        );
        spinner?.classList.add('ons-u-hidden');
      }
    }, 500);
  }
});
