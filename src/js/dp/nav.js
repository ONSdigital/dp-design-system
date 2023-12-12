function toggleSubnav(element) {
  element.classList.toggle('js-expandable-active');
  element.querySelectorAll('.js-expandable__content').forEach((el) => {
    el.classList.toggle('js-nav-hidden');
  });

  const elementAria = getBoolFromString(element.querySelector('a:first-child').ariaExpanded);
  element.querySelector('a:first-child').ariaExpanded = !elementAria;
  const subnavAria = getBoolFromString(element.querySelector('.js-expandable__content').ariaExpanded);
  element.querySelector('.js-expandable__content').ariaExpanded = !subnavAria;
}

function toggleMenu(toggleElement, menuElement) {
  toggleElement.classList.toggle('menu-is-expanded');
  const toggleAriaState = getBoolFromString(
    toggleElement.querySelector('a').ariaExpanded,
  );
  toggleElement.querySelector('a').ariaExpanded = !toggleAriaState;
  menuElement.classList.toggle('nav-main--hidden');
  const menuAriaState = getBoolFromString(menuElement.ariaExpanded);
  menuElement.ariaExpanded = !menuAriaState;
}

function getBoolFromString(stringToConvert) {
  return (stringToConvert == 'true') ? true : false;
}

function toggleSearch(toggleElement, searchElement) {
  const langAttribute = document.documentElement.lang;
  toggleElement.classList.toggle('search-is-expanded');
  const toggleAriaState = getBoolFromString(
    toggleElement.querySelector('a').ariaExpanded,
  );
  toggleElement.querySelector('a').ariaExpanded = !toggleAriaState;
  let searchStr = '';
  if (langAttribute == 'en') {
    toggleElement
      .querySelector('.nav--controls__text')
      .textContent.includes('Hide')
      ? (searchStr = 'Search')
      : (searchStr = 'Hide search');
  } else {
    toggleElement
      .querySelector('.nav--controls__text')
      .textContent.includes('Cuddio')
      ? (searchStr = 'Chwilio')
      : (searchStr = 'Cuddio');
  }
  toggleElement.querySelector('.nav--controls__text').textContent = searchStr;
  searchElement.classList.toggle('nav-search--hidden');
  const searchAriaState = getBoolFromString(searchElement.ariaExpanded);
  searchElement.ariaExpanded = !searchAriaState;
}

function cloneSecondaryNav() {
  // On mobile move secondary nav items in header to primary nav
  const navLink = document.querySelectorAll('.js-nav-clone__link');
  const navList = document.querySelector('.js-nav-clone__list');

  if (
    document.body.classList.contains('viewport-sm')
    && navList.querySelectorAll('.js-nav-clone__link').length > 0
  ) {
    // Remove from separate UL and add into primary
    navLink.forEach((link) => {
      link.parentNode.style.display = 'none';
      const newNavItem = document.createElement('li');
      newNavItem.classList.add('primary-nav__item');

      link.classList.remove('secondary-nav__link');
      link.classList.add('primary-nav__link', 'col');

      newNavItem.insertAdjacentElement('beforeend', link);

      const primaryNavList = document.querySelector(
        '.primary-nav__list li.primary-nav__language',
      );
      primaryNavList.insertAdjacentElement('beforebegin', newNavItem);
    });
  } else if (
    !document.body.classList.contains('viewport-sm')
    && document.querySelector('.secondary-nav__item').style.display === 'none'
  ) {
    // Remove from primary nav and add into separate secondary list
    navLink.forEach((link, i) => {
      const index = i + 1;
      link.classList.add('secondary-nav__link');
      link.classList.remove('primary-nav__link', 'col');
      link.parentNode.remove();
      const cloneList = document.querySelector(
        `.js-nav-clone__list li:nth-child(${index})`,
      );
      cloneList.insertAdjacentElement('beforeend', link);
      link.parentNode.style.display = 'block';
    });
  }
}

function clonePrimaryItems() {
  const detectDuplicate = document.querySelectorAll('.js-nav__duplicate');
  const expandableList = document.querySelectorAll('.js-expandable');

  // Clone primary nav items into sub-menu on mobile, so it can still be selected on mobile
  if (
    document.body.classList.contains('viewport-sm')
    && detectDuplicate.length === 0
  ) {
    expandableList.forEach((item) => {
      const href = item.querySelector('a').getAttribute('href');
      const text = item.querySelector('.submenu-title').innerText;
      const childList = item.querySelector('.js-expandable__content');

      const newLink = document.createElement('a');
      newLink.classList.add('primary-nav__child-link');
      newLink.href = href;
      newLink.innerText = text.trim();

      const newItem = document.createElement('li');
      newItem.classList.add(
        'primary-nav__child-item',
        'js-nav__duplicate',
        'js-expandable__child',
      );
      newItem.insertAdjacentElement('beforeend', newLink);
      childList.insertBefore(newItem, childList.firstChild);
    });
  } else if (
    !document.body.classList.contains('viewport-sm')
    && detectDuplicate.length > 0
  ) {
    detectDuplicate.forEach((duplicate) => {
      duplicate.remove();
    });
  }
}

window.addEventListener('resize', function () {
  clonePrimaryItems();
  cloneSecondaryNav();
});

document.addEventListener('DOMContentLoaded', function () {
  const primaryNav = document.querySelector('#nav-primary');
  const searchBar = document.querySelector('#searchBar');
  const navItem = document.querySelectorAll('.js-nav');
  const expandableItems = document.querySelectorAll('.js-expandable');

  clonePrimaryItems();
  cloneSecondaryNav();

  primaryNav.classList.add('nav-main--hidden');
  primaryNav.ariaExpanded = false;

  expandableItems.forEach((item) => {
    item.addEventListener('click', function (event) {
      if (document.body.classList.contains('viewport-sm')) {
        event.preventDefault();
        toggleSubnav(this);
      }
    });
  });

  // stop parent element from taking over all click events
  document
    .querySelectorAll('.js-expandable > .js-expandable__content')
    .forEach((elem) => {
      elem.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    });

  navItem.forEach((item) => {
    item.addEventListener('keydown', function (e) {
      const focusedItem = document.querySelector(
          '.js-expandable__child a:focus',
        ), // only selects child item that is in focus
        keycode = e.keyCode,
        up = '38',
        down = '40',
        right = '39',
        left = '37',
        esc = '27',
        tab = '9';
      if (keycode == tab && focusedItem) {
        item.classList.remove('primary-nav__item--focus');
        item.nextElementSibling.focus();
      }
      if (keycode == esc) {
        item.classList.remove('primary-nav__item--focus');
        const closestNav = item.closest('.js-nav');
        const link = closestNav.querySelector('a');
        link.classList.add('hide-children');
        link.focus();
        link.addEventListener('focusout', function () {
          link.classList.remove('hide-children');
        });
      }
      if (keycode == down) {
        e.preventDefault();
        item.classList.add('primary-nav__item--focus');
        if (focusedItem) {
          focusedItem.parentElement.nextElementSibling
            .querySelector('a')
            .focus();
        } else {
          item.querySelector('.js-expandable__child a').focus();
        }
      }
      if (keycode == up) {
        e.preventDefault();
        if (focusedItem && focusedItem.parentElement.previousElementSibling) {
          focusedItem.parentElement.previousElementSibling
            .querySelector('a')
            .focus();
        } else {
          item.classList.remove('primary-nav__item--focus');
          item.querySelector('a').focus();
        }
      }
      if (keycode == right) {
        e.preventDefault();
        item.classList.remove('primary-nav__item--focus');
        const closestNav = item.closest('.js-nav');
        closestNav.nextElementSibling.querySelector('a').focus();
      }
      if (keycode == left) {
        e.preventDefault();
        item.classList.remove('primary-nav__item--focus');
        const closestNav = item.closest('.js-nav');
        closestNav.previousElementSibling.querySelector('a').focus();
      }
    });
  });

  const expandBehaviour = (item, expandedBool) => {
    if (!document.body.classList.contains('viewport-sm')) {
      const navLink = item.querySelector('.primary-nav__link');
      navLink.ariaExpanded = expandedBool;
      const expandable = item.querySelector('.js-expandable__content');
      expandable.ariaExpanded = expandedBool;
    }
  };

  expandableItems.forEach((item) => {
    item.addEventListener('focusin', () => expandBehaviour(item, true));
    item.addEventListener('pointerenter', () => expandBehaviour(item, true));
  });

  expandableItems.forEach((item) => {
    item.addEventListener('focusout', () => expandBehaviour(item, false));
    item.addEventListener('pointerleave', () => expandBehaviour(item, false));
  });

  const menuToggle = document.querySelector('#menu-toggle');
  const menuToggleContainer = menuToggle.parentNode;
  const searchToggle = document.querySelector('#search-toggle');
  const searchToggleContainer = searchToggle.parentNode;

  menuToggle.addEventListener('click', function (event) {
    event.preventDefault();
    if (!searchBar.classList.contains('nav-search--hidden')) {
      toggleSearch(searchToggleContainer, searchBar);
    } 
    toggleMenu(menuToggleContainer, primaryNav);
  });

  searchToggle.addEventListener('click', function (event) {
    event.preventDefault();
    if (!primaryNav.classList.contains('nav-main--hidden')) {
      toggleMenu(menuToggleContainer, primaryNav);
    }
    toggleSearch(searchToggleContainer, searchBar);
  });
});
