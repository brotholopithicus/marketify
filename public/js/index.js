let chartData = [];
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
    }, 20);
}

function searchClickHandler(e) {
    const tag = searchInput.value;
    searchInput.value = '';
    requestify(`/api/stocks/${tag}`, 'GET').then(JSON.parse).then(response => {
        chartData.push({ name: tag, data: response, tooltip: { valueDecimals: 2 } });
        clearChartContainer();
        generateChart(chartData);
    });
}

function clearChartContainer() {
    const chart = document.querySelector('#container');
    document.body.removeChild(chart);
    const el = document.createElement('div');
    el.id = 'container';
    document.body.insertBefore(el, searchContainer);
}
requestify('/api/stocks', 'GET').then(JSON.parse).then(response => {
    return new Promise((resolve, reject) => {
        const data = [];
        response.forEach(item => {
            const itemData = [Date.parse(item.Date), Number(parseFloat(item.Close).toFixed(2))];
            data.push(itemData);
        });
        resolve(data);
    });
}).then(data => {
    data = data.sort((a, b) => a[0] - b[0]);
    chartData.push({
        name: 'YHOO',
        data,
        tooltip: {
            valueDecimals: 2
        }
    });
    generateChart(chartData);
});

function generateChart(data) {
    Highcharts.stockChart('container', {
        rangeSelector: {
            selected: 1
        },
        title: {
            text: 'Stock Price'
        },
        series: data
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
