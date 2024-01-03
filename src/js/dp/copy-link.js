document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.querySelector('.ons-copy-link__btn');
  const btnText = copyBtn?.querySelector('.ons-btn__inner');
  const elemInitialContent = btnText?.textContent;
  let timeoutId;

  function resetBtnState(element, initialContent) {
    const el = element;
    el.textContent = initialContent;
    copyBtn.removeAttribute('aria-live', 'polite');
  }

  function failure(element) {
    return () => {
      const el = element;
      el.textContent = element.dataset.copyLinkFailure;
      copyBtn.classList.add('ons-btn--disabled');
      copyBtn.setAttribute('aria-live', 'polite');
      copyBtn.setAttribute('disabled', 'true');
    };
  }

  function success(element) {
    return () => {
      const el = element;
      el.textContent = element.dataset.copyLinkSuccess;
      copyBtn.setAttribute('aria-live', 'polite');
      timeoutId = setTimeout(resetBtnState, 5000, btnText, elemInitialContent);
    };
  }

  function copyText() {
    clearTimeout(timeoutId);
    navigator.clipboard
      .writeText(window.location.href)
      .then(success(btnText), failure(btnText))
      .catch((error) => console.error(error));
  }

  if (copyBtn && navigator.clipboard) {
    copyBtn.addEventListener('click', copyText);
    copyBtn.classList.remove('ons-u-d-no');
  }
});
