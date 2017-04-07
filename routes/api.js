const express = require('express');
const router = express.Router();

const qs = require('querystring');

router.get('/stocks/:id', (req, res, next) => {
    const baseUrl = 'https://query.yahooapis.com/v1/public/yql?';
    const yql = `select * from yahoo.finance.historicaldata where symbol = "${req.params.id}" and startDate = "2016-04-06" and endDate = "2017-04-06"`;
    const query = { q: yql, format: 'json', env: 'store://datatables.org/alltableswithkeys' };
    const route = baseUrl + qs.stringify(query);
    requestify(route).then(JSON.parse).then(response => {
        const data = [];
        response.query.results.quote.forEach(quote => {
            const dataItem = [Date.parse(quote.Date), Number(quote.Close)];
            data.push(dataItem);
        });
        const sortedData = data.sort((a, b) => a[0] - b[0]);
        return res.json(sortedData);
    });
});

function requestify(config, data) {
    if (typeof config === 'string') config = require('url').parse(config);
    return new Promise((resolve, reject) => {
        const protocol = config.protocol === 'https:' ? require('https') : require('http');
        const req = protocol.request(config, (res) => {
            if (res.statusCode < 200 || res.statusCode > 299) return reject(new Error(`Request Failed: StatusCode = ${res.statusCode}`));
            const body = [];
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => resolve(body.join('')));
        });
        req.on('error', (err) => reject(err));
        if (data) req.write(data);
        req.end();
    });
}

module.exports = router;
