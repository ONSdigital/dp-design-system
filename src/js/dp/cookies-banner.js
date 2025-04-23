// cookies settings
function hasCookiesPreferencesSet() {
  return document.cookie.indexOf('cookies_preferences_set=true') > -1;
}

function userIsOnCookiesPreferencesPage() {
  const href = window.location.href.split('/');

  // check that last element in href array is 'cookies' - in case we add further pages
  // within the cookies path
  const isCookiesPreferencesPage = href[href.length - 1] === 'cookies';
  return isCookiesPreferencesPage;
}

function extractDomainFromUrl(url) {
  if (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0) {
    return 'localhost';
  }

  // top level domains (TLD/SLD) in use
  const pattern = '(.uk|.onsdigital.uk|.gov.uk)';
  const tlds = new RegExp(pattern);

  const topLevelDomain = url.match(tlds)[0];
  const secondLevelDomain = url.replace(topLevelDomain, '').split('.').pop();

  return `.${secondLevelDomain}${topLevelDomain}`;
}

const cookiesSet = hasCookiesPreferencesSet();

function submitCookieForm(e) {
  e.preventDefault();

  const oneYearInSeconds = 31622400;
  const currentUrl = window.location.hostname;
  const cookiesDomain = extractDomainFromUrl(currentUrl);
  const cookiesPreference = true;
  const encodedCookiesPolicy = '%7B%22essential%22%3Atrue%2C%22usage%22%3Atrue%7D';
  const defaultCookiesPolicy = '%7B%22essential%22%3Atrue%2C%22usage%22%3Afalse%7D';
  const cookiesPath = '/';
  const cookiesAcceptButton = document.querySelector('.js-accept-cookies');
  const cookiesRejectButton = document.querySelector('.js-reject-cookies');
  const cookiesAcceptedText = document.querySelector('.ons-js-accepted-text');
  const cookiesRejecedText = document.querySelector('.ons-js-rejected-text');
  const action = document.activeElement.getAttribute('data-action');

  if (cookiesAcceptButton || cookiesRejectButton) {
    cookiesAcceptButton.disabled = true;
    cookiesAcceptButton.classList.add('btn--primary-disabled');
    cookiesRejectButton.disabled = true;
    cookiesRejectButton.classList.add('btn--primary-disabled');
  }

  document.cookie = `cookies_preferences_set=${cookiesPreference};max-age=${oneYearInSeconds};domain=${cookiesDomain};path=${cookiesPath};`;
  switch (action) {
    case 'accept':
      document.cookie = `cookies_policy=${encodedCookiesPolicy};max-age=${oneYearInSeconds};domain=${cookiesDomain};path=${cookiesPath};`;
      cookiesAcceptedText.classList.remove('hidden');
      break;
    case 'reject':
      document.cookie = `cookies_policy=${defaultCookiesPolicy};max-age=${oneYearInSeconds};domain=${cookiesDomain};path=${cookiesPath};`;
      cookiesRejecedText.classList.remove('hidden');
      break;
    default:
      return;
  }

  const informDetails = document.querySelector('.js-cookies-banner-inform');
  if (informDetails) {
    informDetails.classList.add('hidden');
  }

  const acceptConfirmation = document.querySelector(
    '.js-cookies-banner-confirmation',
  );
  if (acceptConfirmation) {
    acceptConfirmation.classList.remove('hidden');
  }
}

const cookiesBanner = document.querySelector('.js-cookies-banner-form');
function initCookiesBanner() {
  const jsHideBanner = document.querySelector('.js-hide-cookies-banner');
  if (jsHideBanner) {
    jsHideBanner.addEventListener('click', () => cookiesBanner.classList.add('hidden'));
  }

  if (cookiesBanner) {
    cookiesBanner.addEventListener('submit', submitCookieForm);
  }
}

function determineWhetherToRenderBanner() {
  if (!cookiesSet && !userIsOnCookiesPreferencesPage()) {
    cookiesBanner.classList.remove('cookies-banner--hidden');
    initCookiesBanner();
  }
}

document.addEventListener('DOMContentLoaded', determineWhetherToRenderBanner);
