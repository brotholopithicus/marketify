let chartData = [];
const stockQuoteList = document.querySelector('.stock-quote-list');
const searchContainer = document.querySelector('.search-container');
const searchInput = document.querySelector('input#tag');
searchInput.focus();
const searchButton = document.querySelector('button#search');
searchButton.addEventListener('click', searchClickHandler);
searchInput.addEventListener('keydown', searchInputKeyDownHandler);

function searchInputKeyDownHandler(e) {
    if (e.keyCode === 13) return searchButton.click();
    setTimeout(() => {
        searchInput.value = searchInput.value.toUpperCase();
    }, 1);
}

function addToStockQuoteList(data) {
    const div = document.createElement('div');
    div.style.border = '1px solid black';
    div.classList.add('stock-quote');
    const symbol = document.createElement('h4');
    symbol.style.color = data.color;
    symbol.textContent = data.name + ' : ' + data.current.toFixed(2);
    div.appendChild(symbol);
    stockQuoteList.appendChild(div);
}

function searchClickHandler(e) {
    const tag = searchInput.value;
    searchInput.value = '';
    requestify(`/api/stocks/${tag}`, 'GET')
        .then(JSON.parse)
        .then(response => {
            chartData.push({ name: tag, data: response });
            clearChartContainer();
            generateChart();
        });
}

function clearStockQuoteList() {
    const list = document.querySelectorAll('.stock-quote');
    list.forEach(item => stockQuoteList.removeChild(item));
}

function clearChartContainer() {
    clearStockQuoteList();
    const chart = document.querySelector('#container');
    document.body.removeChild(chart);
    const el = document.createElement('div');
    el.id = 'container';
    document.body.insertBefore(el, searchContainer);
}

function getYahooQuote() {
    requestify(`/api/stocks/YHOO`, 'GET')
        .then(JSON.parse)
        .then(response => {
            chartData.push({ name: 'YHOO', data: response });
            generateChart();
        });
}

function generateChart() {
    chartData.forEach(item => {
        item.color = `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;
        addToStockQuoteList({ name: item.name, current: item.data[item.data.length - 1][1], color: item.color });
    });

    Highcharts.stockChart('container', {
        rangeSelector: {
            selected: 4
        },
        yAxis: {
            labels: {
                formatter() {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },
        plotOptions: {
            series: {
                compare: 'percent',
                showInNavigator: true
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2,
            split: true
        },
        series: chartData
    });
}

function requestify(url, method, data) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(Error(`DELETE request failed with error: ${xhr.statusText}`));
            }
        }
        xhr.onerror = (err) => reject(`Network Error: ${err}`);
        xhr.send(data);
    })
}

window.onload = () => getYahooQuote();
