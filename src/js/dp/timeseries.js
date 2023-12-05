const timeSeriesContainer = document.querySelector('#timeSeriesContainer');
// time series
if (timeSeriesContainer) {
  const basket = timeSeriesContainer.querySelector('#timeseries__basket');
  const buttons = timeSeriesContainer.querySelectorAll('.timeseries__remember, .timeseries__download');
  const noTimeseries = timeSeriesContainer.querySelector('.timeseries__empty');
  const xlsForm = timeSeriesContainer.querySelector('#xls-form');
  const csvForm = timeSeriesContainer.querySelector('#csv-form');
  const list = timeSeriesContainer.querySelector('.timeseries__list');
  const timeseriesList = {};
  const basketCookieName = 'timeseriesBasket';
  const rememberCookieName = 'rememberBasket';
  let listCount = 0;
  const counter = timeSeriesContainer.querySelector('#timeseries__count');
  const exitBtn = timeSeriesContainer.querySelector('.timeseries__list--exit');
  const rememberCb = timeSeriesContainer.querySelector('#remember-selection');

  exitBtn.addEventListener('click', () => {
    boxWithStuff.classList.toggle('hidden');
  });

  function initialize() {
    remember = getLocalStorageProperty(rememberCookieName);
    if (typeof remember === 'undefined') {
      // remember cookie never set, sets to true by default
      remember = true;
      setLocalStorageProperty(rememberCookieName, remember, 7);
      rememberCb.checked = true;
    }

    if (remember) {
      const timeSeries = getLocalStorageProperty(basketCookieName);
      timeSeries.forEach((timeseriesTemp) => {
        const timeseries = {
          uri: timeseriesTemp.uri,
          datasetId: timeseriesTemp.datasetId,
          title: timeseriesTemp.title,
        };
        timeseriesList[timeseries.uri] = timeseries;
        addToPage(timeseries);
        checkIfItemsAreSelected();
      });
    } else {
      setLocalStorageProperty(basketCookieName, null, 0);
    }
  }

  initialize();

  // select the target node
  const target = timeSeriesContainer;

  // create an observer instance
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('time-series-results') && mutation.addedNodes.length > 0) {
        checkIfItemsAreSelected();
      }
    });
  });

  // configuration of the observer:
  const config = { childList: true, subtree: true, characterData: true }; // ,subtree: true, characterData: true

  // pass in the target node, as well as the observer options
  observer.observe(target, config);

  let remember = getLocalStorageProperty(rememberCookieName);
  if (remember) {
    rememberCb.checked = true;
  }

  rememberCb.addEventListener('input', () => {
    if (rememberCb.checked) {
      setLocalStorageProperty(rememberCookieName, true, 7);
      setLocalStorageProperty(basketCookieName, JSON.stringify(Object.values(timeseriesList)), 7);
    } else {
      setLocalStorageProperty(rememberCookieName, false, 7);
      setLocalStorageProperty(basketCookieName, null, 7);
    }
  });

  timeSeriesContainer.querySelector('.time-series-results').addEventListener('click', (event) => {
    if (event.target.classList.contains('select-time-series')) {
      if (event.target.checked) {
        if (Object.keys(timeseriesList).length < 50) {
          addElement(event.target);
        } else {
          alert('You can only add up to 50 timeseries at a time');
        }
      } else {
        removeElement(event.target.getAttribute('data-uri'));
      }
    }
    if (event.target.id === 'select-all-time-series') {
      if (event.target.checked) {
        selectAll();
      } else {
        deselectAll();
      }
    }
  });

  let boxWithStuff = timeSeriesContainer.querySelector('#timeseriesListContainer');

  function checkIfItemsAreSelected() {
    const checkboxesTemp = timeSeriesContainer.querySelectorAll('.select-time-series');
    let allSelected = true;
    checkboxesTemp.forEach((item) => {
      if (timeseriesList.hasOwnProperty(item.getAttribute('data-uri'))) {
        item.checked = true;
      } else {
        allSelected = false;
      }
    });
    if (allSelected) {
      timeSeriesContainer.querySelector('#select-all-time-series').checked = true;
    }
  }

  function addElement(element) {
    const timeseries = {
      title: element.getAttribute('data-title'),
      uri: element.getAttribute('data-uri'),
      datasetId: element.getAttribute('data-dataset-id'),
    };

    if (timeseriesList.hasOwnProperty(timeseries.uri)) {
      return; // it is already in the list
    }

    timeseriesList[timeseries.uri] = timeseries;
    addToPage(timeseries);
  }

  function removeElement(uri) {
    listCount--;
    delete timeseriesList[uri];
    counter.innerHTML = listCount;
    remove(list, uri);
    if (list.children.length === 0) {
      buttons.forEach((btn) => {
        btn.style.display = 'none';
      });
      if (noTimeseries.classList.contains('hidden')) {
        noTimeseries.classList.remove('hidden');
      }
    }
  }

  function addToLocalStorageProperty(timeseries) {
    timeseriesList[timeseries.uri] = timeseries;
    setLocalStorageProperty(basketCookieName, JSON.stringify(Object.values(timeseriesList)), 7);
  }

  // Add time series markup to basket, and put hidden inputs for download
  function addToPage(timeseries) {
    listCount++;
    counter.innerHTML = listCount;
    list.prepend(getListElementMarkup(timeseries));
    if (getLocalStorageProperty(rememberCookieName)) {
      addToLocalStorageProperty(timeseries);
    }
    xlsForm.appendChild(getInputMarkup(timeseries));
    csvForm.appendChild(getInputMarkup(timeseries));
    buttons.forEach((btn) => {
      btn.style.display = 'block';
    });
    if (!noTimeseries.classList.contains('hidden')) {
      noTimeseries.classList.add('hidden');
    }
  }

  function selectAll() {
    let alertShown = false;
    timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
      if (Object.keys(timeseriesList).length < 50) {
        item.checked = true;
        addElement(item);
      } else if (!alertShown) {
        alert('You can only add up to 50 timeseries at a time');
        timeSeriesContainer.querySelector('#select-all-time-series').checked = false;
        alertShown = true;
      }
    });
  }

  function setLocalStorageProperty(cname, cvalue, exdays) {
    localStorage.setItem(cname, cvalue);
  }

  function getLocalStorageProperty(name) {
    const result = JSON.parse(localStorage.getItem(name));
    return result;
  }

  function deselectAll() {
    timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
      item.checked = false;
      removeElement(item.getAttribute('data-uri'));
    });
  }

  function remove(element, uri) {
    const listItem = findIn(element, uri);
    if (listItem) {
      listItem.remove();
    }
  }

  function findIn(element, uri) {
    return element.querySelector(`[data-uri="${uri}]`);
  }

  function getListElementMarkup(timeseries) {
    const listItem = document.createElement('li');
    listItem.classList.add('flush', 'col-wrap');
    listItem.setAttribute('data-uri', timeseries.uri);
    const listItemParagraph = document.createElement('p');
    listItemParagraph.classList.add('flush', 'col', 'col--md-22', 'col--lg-22');
    listItemParagraph.innerHTML = timeseries.title;
    const listItemDiv = document.createElement('div');
    listItemDiv.classList.add('col', 'col--md-4', 'col--lg-4');
    const listItemRemoveBtn = document.createElement('button');
    listItemRemoveBtn.classList.add('btn', 'btn--primary', 'btn--thin', 'btn--small', 'btn--narrow', 'float-right', 'margin-top-md--1', 'js-remove-selected');
    listItemRemoveBtn.innerText = 'remove';

    listItemRemoveBtn.addEventListener('click', async (e) => {
      removeElement(timeseries.uri);
      timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
        if (item.getAttribute('data-uri') === timeseries.uri) {
          item.checked = false;
          timeSeriesContainer.querySelector('#select-all-time-series').checked = false;
        }
      });
    });

    listItemDiv.appendChild(listItemRemoveBtn);
    listItem.appendChild(listItemParagraph);
    listItem.appendChild(listItemDiv);

    return listItem;
  }

  function getInputMarkup(timeseries) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'uri';
    input.setAttribute('uri', timeseries.uri);
    input.value = timeseries.uri;
    return input;
  }

  basket.addEventListener('click', async (e) => {
    boxWithStuff.classList.toggle('hidden');
  });
}
