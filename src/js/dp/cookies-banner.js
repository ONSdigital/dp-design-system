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
  const cookiesPath = '/';
  const cookiesAcceptBanner = document.querySelector('.js-accept-cookies');

  if (cookiesAcceptBanner) {
    cookiesAcceptBanner.disabled = true;
    cookiesAcceptBanner.classList.add('btn--primary-disabled');
  }

  document.cookie = `cookies_preferences_set=${cookiesPreference};max-age=${oneYearInSeconds};domain=${cookiesDomain};path=${cookiesPath};`;
  document.cookie = `cookies_policy=${encodedCookiesPolicy};max-age=${oneYearInSeconds};domain=${cookiesDomain};path=${cookiesPath};`;

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
