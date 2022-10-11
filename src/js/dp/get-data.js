import { gtmDataLayerPush } from "../utilities";

document.addEventListener("DOMContentLoaded", function () {
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
