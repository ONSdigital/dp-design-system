const timeSeriesContainer = document.querySelector('#timeSeriesContainer');
// time series
if (timeSeriesContainer) {
  const basket = timeSeriesContainer.querySelector('#timeseries__basket');
  const buttons = timeSeriesContainer.querySelectorAll('.timeseries__remember, .timeseries__download');
  const timeseriesBasketEmpty = timeSeriesContainer.querySelector('.timeseries__empty');
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
  const timeseriesBasketModal = timeSeriesContainer.querySelector('#timeseriesListContainer');

  const checkIfItemsAreSelected = () => {
    const checkboxesTemp = timeSeriesContainer.querySelectorAll('.select-time-series');
    let allSelected = true;
    checkboxesTemp.forEach((item) => {
      if (Object.hasOwn(timeseriesList, item.getAttribute('data-uri'))) {
        const checkbox = item;
        checkbox.checked = true;
      } else {
        allSelected = false;
      }
    });
    if (allSelected) {
      timeSeriesContainer.querySelector('#select-all-time-series').checked = true;
    }
  };

  const setLocalStorageProperty = (cname, cvalue) => {
    localStorage.setItem(cname, cvalue);
  };

  const getLocalStorageProperty = (name) => {
    const result = JSON.parse(localStorage.getItem(name));
    return result;
  };

  const addTimeseriesToLocalStorage = (timeseries) => {
    timeseriesList[timeseries.uri] = timeseries;
    setLocalStorageProperty(basketCookieName, JSON.stringify(Object.values(timeseriesList)));
  };

  const removeTimeseriesFromLocalStorage = (uri) => {
    delete timeseriesList[uri];
    setLocalStorageProperty(basketCookieName, JSON.stringify(Object.values(timeseriesList)));
  };

  const findElementByTimeseriesURI = (element, uri) => element.querySelector(`[data-uri="${uri}"]`);

  const removeTimeseriesElement = (listElement, uri) => {
    const listItem = findElementByTimeseriesURI(listElement, uri);
    if (listItem) {
      listItem.remove();
    }
  };

  const findTimeseriesDownloadInput = (parent, uri) => parent.querySelector(`input[uri="${uri}"]`);

  const removeTimeseriesDownloadInputs = (uri) => {
    findTimeseriesDownloadInput(xlsForm, uri).remove();
    findTimeseriesDownloadInput(csvForm, uri).remove();
  };

  const displayBasketEmpty = () => {
    buttons.forEach((btn) => {
      const button = btn;
      button.style.display = 'none';
    });
    if (timeseriesBasketEmpty.classList.contains('hidden')) {
      timeseriesBasketEmpty.classList.remove('hidden');
    }
  };

  const removeTimeseriesFromBasket = (uri) => {
    listCount -= 1;
    counter.innerHTML = listCount;
    removeTimeseriesElement(list, uri);
    if (list.children.length === 0) {
      displayBasketEmpty();
    }
    removeTimeseriesFromLocalStorage(uri);
    removeTimeseriesDownloadInputs(uri);
  };

  const deselectAll = () => {
    timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
      const checkbox = item;
      checkbox.checked = false;
      removeTimeseriesFromBasket(item.getAttribute('data-uri'));
    });
  };

  const getListElementMarkup = (timeseries) => {
    const listItem = document.createElement('li');
    listItem.classList.add('col-wrap');
    listItem.setAttribute('data-uri', timeseries.uri);

    const listItemParagraph = document.createElement('p');
    listItemParagraph.classList.add('col', 'col--md-22', 'col--lg-22', 'ons-u-pr-s');
    listItemParagraph.innerHTML = timeseries.title;

    const listItemDiv = document.createElement('div');
    listItemDiv.classList.add('col', 'col--md-6', 'col--lg-6');

    const listItemRemoveBtn = document.createElement('button');
    listItemRemoveBtn.classList.add('ons-btn', 'ons-btn--primary', 'ons-btn--small', 'js-remove-selected');

    const listItemRemoveBtnInner = document.createElement('span');
    listItemRemoveBtnInner.classList.add('ons-btn__inner');

    const listItemRemoveBtnText = document.createElement('span');
    listItemRemoveBtnText.classList.add('ons-btn__text');
    listItemRemoveBtnText.innerText = 'Remove';

    listItemRemoveBtnInner.appendChild(listItemRemoveBtnText);
    listItemRemoveBtn.appendChild(listItemRemoveBtnInner);

    listItemRemoveBtn.addEventListener('click', async () => {
      removeTimeseriesFromBasket(timeseries.uri);
      timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
        if (item.getAttribute('data-uri') === timeseries.uri) {
          const checkbox = item;
          checkbox.checked = false;
          timeSeriesContainer.querySelector('#select-all-time-series').checked = false;
        }
      });
    });

    listItemDiv.appendChild(listItemRemoveBtn);
    listItem.appendChild(listItemParagraph);
    listItem.appendChild(listItemDiv);

    return listItem;
  };

  const getInputMarkup = (timeseries) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'uri';
    input.setAttribute('uri', timeseries.uri);
    input.value = timeseries.uri;
    return input;
  };

  // Add time series markup to basket, and put hidden inputs for download
  const addTimeseriesToBasket = (timeseries) => {
    listCount += 1;
    counter.innerHTML = listCount;
    list.prepend(getListElementMarkup(timeseries));
    if (getLocalStorageProperty(rememberCookieName)) {
      addTimeseriesToLocalStorage(timeseries);
    }
    xlsForm.appendChild(getInputMarkup(timeseries));
    csvForm.appendChild(getInputMarkup(timeseries));
    buttons.forEach((btn) => {
      const button = btn;
      button.style.display = 'block';
    });
    if (!timeseriesBasketEmpty.classList.contains('hidden')) {
      timeseriesBasketEmpty.classList.add('hidden');
    }
  };

  const addTimeseriesToBasketFromElement = (element) => {
    const timeseries = {
      title: element.getAttribute('data-title'),
      uri: element.getAttribute('data-uri'),
      datasetId: element.getAttribute('data-dataset-id'),
    };

    if (Object.hasOwn(timeseriesList, timeseries.uri)) {
      return; // it is already in the list
    }

    timeseriesList[timeseries.uri] = timeseries;
    addTimeseriesToBasket(timeseries);
  };

  const selectAll = () => {
    let alertShown = false;
    timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
      if (Object.keys(timeseriesList).length < 50) {
        const checkbox = item;
        checkbox.checked = true;
        addTimeseriesToBasketFromElement(checkbox);
      } else if (!alertShown) {
        alert('You can only add up to 50 timeseries at a time'); // eslint-disable-line
        timeSeriesContainer.querySelector('#select-all-time-series').checked = false;
        alertShown = true;
      }
    });
  };

  const initialize = () => {
    exitBtn.addEventListener('click', () => {
      timeseriesBasketModal.classList.toggle('hidden');
    });

    let remember = getLocalStorageProperty(rememberCookieName);
    if (remember) {
      rememberCb.checked = true;
    }

    remember = getLocalStorageProperty(rememberCookieName);
    if (typeof remember === 'undefined') {
      // remember cookie never set, sets to true by default
      remember = true;
      setLocalStorageProperty(rememberCookieName, remember);
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
        addTimeseriesToBasket(timeseries);
        checkIfItemsAreSelected();
      });
    } else {
      setLocalStorageProperty(basketCookieName, null);
    }
  };

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
  const config = { childList: true, subtree: true, characterData: true };

  // pass in the target node, as well as the observer options
  observer.observe(target, config);

  rememberCb.addEventListener('input', () => {
    if (rememberCb.checked) {
      setLocalStorageProperty(rememberCookieName, true);
      setLocalStorageProperty(basketCookieName, JSON.stringify(Object.values(timeseriesList)));
    } else {
      setLocalStorageProperty(rememberCookieName, false);
      setLocalStorageProperty(basketCookieName, null);
    }
  });

  timeSeriesContainer.querySelector('.time-series-results').addEventListener('click', (event) => {
    if (event.target.classList.contains('select-time-series')) {
      if (event.target.checked) {
        if (Object.keys(timeseriesList).length < 50) {
          addTimeseriesToBasketFromElement(event.target);
        } else {
          alert('You can only add up to 50 timeseries at a time'); // eslint-disable-line
        }
      } else {
        removeTimeseriesFromBasket(event.target.getAttribute('data-uri'));
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

  basket.addEventListener('click', async () => {
    timeseriesBasketModal.classList.toggle('hidden');
  });
}
