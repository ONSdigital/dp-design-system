document.addEventListener('DOMContentLoaded', function () {
  const copyBtn = document.querySelector('.ons-copy-link__btn');
  const btnText = copyBtn?.querySelector('.ons-btn__inner');
  const elemInitialContent = btnText?.textContent;
  let timeoutId;

  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener('click', copyText);
    copyBtn.classList.remove('ons-u-d-no');
  }

  function copyText() {
    clearTimeout(timeoutId);
    navigator.clipboard
      .writeText(window.location.href)
      .then(success(btnText), failure(btnText))
      .catch((error) => console.error(error));
  }

  function failure(elem) {
    return function () {
      elem.textContent = elem.dataset.copyLinkFailure;
      copyBtn.classList.add('ons-btn--disabled');
      copyBtn.setAttribute('aria-live', 'polite');
      copyBtn.setAttribute('disabled', 'true');
    };
  }

  function success(elem) {
    return function () {
      elem.textContent = elem.dataset.copyLinkSuccess;
      copyBtn.setAttribute('aria-live', 'polite');
      timeoutId = setTimeout(resetBtnState, 5000, btnText, elemInitialContent);
    };
  }

  function resetBtnState(elem, initialContent) {
    elem.textContent = initialContent;
    copyBtn.removeAttribute('aria-live', 'polite');
  }
});
