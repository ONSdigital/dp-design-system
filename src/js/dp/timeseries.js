const timeSeriesContainer = document.querySelector("#timeSeriesContainer");
//time series
if(timeSeriesContainer){
    var listContainer = timeSeriesContainer.querySelector(".timeseries__list-container"),
        basket = timeSeriesContainer.querySelector("#timeseries__basket"),
        resultsContainer = timeSeriesContainer.querySelector("#results"),
        buttons = timeSeriesContainer.querySelectorAll('.timeseries__remember, .timeseries__download'),
        noTimeseries = timeSeriesContainer.querySelector('.timeseries__empty'),
        xlsForm = timeSeriesContainer.querySelector("#xls-form"),
        csvForm = timeSeriesContainer.querySelector("#csv-form"),
        list = timeSeriesContainer.querySelector(".timeseries__list"),
        timeseriesList = {},
        timeseriesUris = [], //saved as cookie, to load selections from the server on page load
        basketCookieName = 'timeseriesBasket',
        rememberCookieName = 'rememberBasket',
        listCount = 0,
        counter = timeSeriesContainer.querySelector('#timeseries__count'),
        exitBtn = timeSeriesContainer.querySelector('.timeseries__list--exit'),
        rememberCb = timeSeriesContainer.querySelector('#remember-selection');

    exitBtn.addEventListener('click', () => {
        boxWithStuff.classList.toggle('hidden');
    });

    function initialize() {
        remember = getCookie(rememberCookieName);
        if (typeof remember === 'undefined') { 
            //remember cookie never set, sets to true by default
            remember = true;
            setCookie(rememberCookieName, remember, 7);
            rememberCb.checked = true;
        }

        if (remember) {
            let timeSeries = getCookie(basketCookieName)
            timeSeries.forEach( timeseriesTemp => {
                var timeseries = {
                    uri: timeseriesTemp.uri,
                    title: timeseriesTemp.title
                };
                timeseriesList[timeseries.uri] = timeseries;
                addToPage(timeseries);
                checkIfItemsAreSelected();
            })
        //             check(findIn(resultsContainer, timeseries.uri));


            // timeseriesUris = Cookies.getJSON(basketCookieName) || [];
            // $.each(timeseriesUris, function(index, uri) {
            //     loadTimeseries(uri);
            // });
            // check($('#remember-selection'));
        } else {
            setCookie(basketCookieName, null, 0);
        }
    }

    initialize();

    // select the target node
    var target = timeSeriesContainer;
    
    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.target.classList.contains('test-delegation') && mutation.addedNodes.length > 0){
                checkIfItemsAreSelected();
            }
        });
    });
    
    // configuration of the observer:
    var config = { childList: true, subtree: true, characterData: true  }; // ,subtree: true, characterData: true 
    
    // pass in the target node, as well as the observer options
    observer.observe(target, config);

    let remember = getCookie(rememberCookieName);
    if(remember){
        rememberCb.checked = true;
    }

    rememberCb.addEventListener('input', () => {
        if(rememberCb.checked){
            setCookie(rememberCookieName, true, 7);
            setCookie(basketCookieName, JSON.stringify(timeseriesUris), 7);
        } else {
            setCookie(rememberCookieName, false, 7);
            setCookie(basketCookieName, null, 7);
        }
    })
    

    timeSeriesContainer.querySelector('.test-delegation').addEventListener('click', (event) => {
        if(event.target.classList.contains('select-time-series')){
            if (event.target.checked) {
                addElement(event.target);
            } else {
                removeElement(event.target.getAttribute("data-uri"));
            }
        }
        if(event.target.id === 'select-all-time-series'){
            if (event.target.checked) {
                selectAll();
            } else {
                deselectAll();
            }
        }
    });
    
    
    let boxWithStuff = timeSeriesContainer.querySelector("#timeseriesListContainer");
    
    function checkIfItemsAreSelected() {
        let checkboxesTemp = timeSeriesContainer.querySelectorAll('.select-time-series');
        let allSelected = true;
        checkboxesTemp.forEach((item) => {
            if (timeseriesList.hasOwnProperty(item.getAttribute("data-uri"))) {
                item.checked = true;
            } else {
                allSelected = false;
            }
        });
        if(allSelected){
            timeSeriesContainer.querySelector('#select-all-time-series').checked = true;
        }
    }

    function addElement(element) {
        var timeseries = {
            title: element.getAttribute("data-title"),
            uri: element.getAttribute("data-uri")
        };
    
        // var timeseries = {
        //   uri: element.data('uri'),
        //   datasetId: element.data('datasetid'),
        //   title: element.data('title')
        // };
        if (timeseriesList.hasOwnProperty(timeseries.uri)) {
            return; // it is already in the list    
        }
        timeseriesList[timeseries.uri] = timeseries;
        addToPage(timeseries)
    }
    
    function removeElement(uri) {
        listCount--;
        var timeseries = timeseriesList[uri];
        delete timeseriesList[uri];
        counter.innerHTML = listCount;
        remove(list, uri)
        if (list.children.length === 0) {
            buttons.forEach((btn) => {
                btn.style.display = 'none';
            });
            if (noTimeseries.classList.contains('hidden')) {
                noTimeseries.classList.remove('hidden');
            }
        }
    }

    function addToCookie(timeseries) {
        timeseriesUris.push(timeseries);
        setCookie(basketCookieName, JSON.stringify(timeseriesUris), 7);
    }
    
    //Add time series markup to basket, and put hidden inputs for download
    function addToPage(timeseries) {
        listCount++;
        counter.innerHTML = listCount;
        list.prepend(getListElementMarkup(timeseries));
        if(getCookie(rememberCookieName)){
            addToCookie(timeseries)
        }
        xlsForm.appendChild(getInputMarkup(timeseries));
        csvForm.appendChild(getInputMarkup(timeseries));
        buttons.forEach((btn) => {
            btn.style.display = 'block';
        })
        if (!noTimeseries.classList.contains('hidden')) {
            noTimeseries.classList.add('hidden');
        }
    }
    
    function selectAll() {
        timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
            item.checked = true;
            addElement(item);
        });
    }

    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        let isSecure = false;
        if(process.env.NODE_ENV === "production"){
            isSecure = true;
        }
        document.cookie = cname + "=" + cvalue + ";" + expires + ";" + (isSecure ? 'Secure' : '') + "path=/";
    }

    function getCookie(name){
        let cookieValue = '';
        let cookieArray = new Array();
        let result = new Array();
      
        //Get cookie
        cookieValue = document.cookie;
      
        //Divide the cookie into an array and convert them to JSON
        if(cookieValue){
          cookieArray = cookieValue.split(';');
          cookieArray.forEach(data => {
            data = data.split('=');
            //data[0]: Cookie name
            //data[1]: Cookie value
            if(data[0].trim() === name){
                result = JSON.parse(data[1]);
            }
          });
        }
        return result;
    }
    
    function deselectAll() {
        timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
            item.checked = false;
            removeElement(item.getAttribute("data-uri"));
        });
    }
    
    function remove(element, uri) {
        var listItem = findIn(element, uri);
        listItem.remove();
    }
    
    function findIn(element, uri) {
        return element.querySelector('[data-uri="' + uri + '"]');
    }
    
    function getListElementMarkup(timeseries) {
        var listItem = document.createElement('li');
        listItem.classList.add('flush', 'col-wrap');
        listItem.setAttribute('data-uri', timeseries.uri);
        var listItemParagraph = document.createElement('p');
        listItemParagraph.classList.add('flush', 'col', 'col--md-22', 'col--lg-22');
        listItemParagraph.innerHTML = timeseries.title;
        var listItemDiv = document.createElement('div');
        listItemDiv.classList.add('col', 'col--md-4', 'col--lg-4');
        var listItemRemoveBtn = document.createElement('button');
        listItemRemoveBtn.classList.add('btn', 'btn--primary', 'btn--thin', 'btn--small', 'btn--narrow', 'float-right', 'margin-top-md--1', 'js-remove-selected');
        listItemRemoveBtn.innerText = 'remove';
    
        listItemRemoveBtn.addEventListener("click", async (e) => {
            removeElement(timeseries.uri);
            timeSeriesContainer.querySelectorAll('.select-time-series').forEach((item) => {
                if (item.getAttribute("data-uri") === timeseries.uri) {
                    item.checked = false;
                    timeSeriesContainer.querySelector('#select-all-time-series').checked = false;
                }
            })
        });
    
        listItemDiv.appendChild(listItemRemoveBtn);
        listItem.appendChild(listItemParagraph);
        listItem.appendChild(listItemDiv);
    
        return listItem;
    }

    function getInputMarkup(timeseries) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'uri';
        input.setAttribute('uri', timeseries.uri);
        input.value = timeseries.uri;
        return input;
    }
    
    basket.addEventListener(
        "click", async (e) => {
            boxWithStuff.classList.toggle('hidden');
        }
    );
}