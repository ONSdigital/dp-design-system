import { initPaginationListeners } from './_helpers';
import {
  contentTypeCheckboxHandler,
  topicFilterCheckboxHandler,
  sortHandler,
  mobileViewFilterHandler,
  keywordSearchHandler,
  dateValidationHandler,
} from './_filter_handlers';

const searchContainer = document.querySelector('.search__container');

if (searchContainer) {
  // create listeners for content-type filter checkboxes controlling each other
  contentTypeCheckboxHandler();

  // create listeners for topic filter checkboxes
  topicFilterCheckboxHandler();

  // create listeners for the sort dropdown
  sortHandler();

  keywordSearchHandler();

  dateValidationHandler();

  initPaginationListeners(searchContainer);

  // filter menu for mobile if the page is running javascript let's make the filter menus
  // togglable and full-screen when displayed
  mobileViewFilterHandler();
}
