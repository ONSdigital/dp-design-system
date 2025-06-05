// Consts
const cookiesBanner = document.querySelector('.js-cookies-banner-form');
const displayCookie = 'ons_cookie_message_displayed';
const preferencesCookie = 'ons_cookie_policy';

// cookies settings
function hasCookiesPreferencesSet() {
  return document.cookie.indexOf(`${displayCookie}=true`) > -1;
}

function userIsOnCookiesPreferencesPage() {
  const path = window.location.pathname;

  // suppress the cookies banner on the cookies preferences page
  const isCookiesPreferencesPage = path === '/cookies';
  return isCookiesPreferencesPage;
}

function extractDomainFromUrl(url) {
  if (url.indexOf('localhost') >= 0 || url.indexOf('127.0.0.1') >= 0) {
    return 'localhost';
  }

  // top level domains (TLD/SLD) in use
  const pattern = '(.uk|.onsdigital.uk|.gov.uk)';
  const tlds = new RegExp(pattern);

  const isKnownDomain = tlds.test(url);

  if (isKnownDomain) {
    return url;
  }

  return '';
}

// setCookiePolicy sets a cookies policy as well as setting the banner cookie to
// being displayed
function setCookiePolicy(policy) {
  const oneYearInSeconds = 31622400;
  const currentUrl = window.location.hostname;
  const cookiesDomain = extractDomainFromUrl(currentUrl);
  const cookiesPath = '/';

  document.cookie = `${displayCookie}=true;max-age=${oneYearInSeconds};domain=${cookiesDomain};path=${cookiesPath};`;
  document.cookie = `${preferencesCookie}=${policy};max-age=${oneYearInSeconds};domain=${cookiesDomain};path=${cookiesPath};`;
}

// submitCookieBannerForm handles submission of the form in the cookie banner
function submitCookieBannerForm(e) {
  e.preventDefault();

  // These policies are invalid JSON but this has to match the way it's done
  // in the design-system repository.
  // See: https://github.com/ONSdigital/design-system/blob/main/src/components/cookies-banner/cookies-banner.js
  const acceptAllCookiesPolicy = "{'essential':true,'settings':true,'usage':true,'campaigns':true}";
  const defaultCookiesPolicy = "{'essential':true,'settings':false,'usage':false,'campaigns':false}";

  const cookiesAcceptButton = document.querySelector('.js-accept-cookies');
  const cookiesRejectButton = document.querySelector('.js-reject-cookies');
  const cookiesAcceptedText = document.querySelector('.ons-js-accepted-text');
  const cookiesRejectedText = document.querySelector('.ons-js-rejected-text');
  const action = document.activeElement.getAttribute('data-action');

  if (cookiesAcceptButton || cookiesRejectButton) {
    cookiesAcceptButton.disabled = true;
    cookiesAcceptButton.classList.add('btn--primary-disabled');
    cookiesRejectButton.disabled = true;
    cookiesRejectButton.classList.add('btn--primary-disabled');
  }

  switch (action) {
    case 'accept':
      setCookiePolicy(acceptAllCookiesPolicy);
      cookiesAcceptedText.classList.remove('hidden');
      break;
    case 'reject':
      setCookiePolicy(defaultCookiesPolicy);
      cookiesRejectedText.classList.remove('hidden');
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

function initCookiesBanner() {
  const jsHideBanner = document.querySelector('.js-hide-cookies-banner');
  if (jsHideBanner) {
    jsHideBanner.addEventListener('click', () => cookiesBanner.classList.add('hidden'));
  }

  if (cookiesBanner) {
    cookiesBanner.addEventListener('submit', submitCookieBannerForm);
  }
}

function determineWhetherToRenderBanner() {
  const cookiesSet = hasCookiesPreferencesSet();

  if (!cookiesSet && !userIsOnCookiesPreferencesPage()) {
    cookiesBanner.classList.remove('cookies-banner--hidden');
    initCookiesBanner();
  }
}

document.addEventListener('DOMContentLoaded', determineWhetherToRenderBanner);
