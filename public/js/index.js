let chartData = [];
const colors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'];
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
    requestify(`/api/stocks/${tag}`, 'GET')
        .then(JSON.parse)
        .then(response => {
            chartData.push({ name: tag, data: response });
            clearChartContainer();
            generateChart();
        });
}

function clearChartContainer() {
    const chart = document.querySelector('#container');
    document.body.removeChild(chart);
    const el = document.createElement('div');
    el.id = 'container';
    document.body.insertBefore(el, searchContainer);
}
requestify('/api/stocks', 'GET')
    .then(JSON.parse)
    .then(response => {
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
            data
        });
        generateChart();
    });

function generateChart() {
    let count = 0;
    chartData.forEach(item => {
        item.color = colors[count];
        count++;
        if (count >= 10) count = 0;
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
