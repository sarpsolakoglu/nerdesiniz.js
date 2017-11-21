const axios = require('axios');
const fx = require('money');
const twit = require('twit');
const schedule = require('node-schedule');
const express = require('express');
const fs = require('fs');

var config = require('./env.json')[process.env.NODE_ENV || 'development'];

const port = process.env.PORT || 3000;

var app = express();

var currentValue;
const nerdesiniz = 'Gezi zamanı Dolar 1.92 oldu diye vatan haini diyenler şimdi Dolar %s, nerdesiniz?';

var T = new twit({
    consumer_key:         config.consumer_key,
    consumer_secret:      config.consumer_secret,
    access_token:         config.access_token,
    access_token_secret:  config.access_token_secret,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});
  
let tweet = (rate) => {
    var tw = nerdesiniz.replace('%s', rate.toFixed(4));
    T.post('statuses/update', { status: tw }, function(err, data, response) {
        var stringData = JSON.stringify(data);
        fs.writeFile('server.log', stringData + '\n', (err) => {
            if (err) {
                console.log("Couldn't log to file");
            }
        });
    });
};

schedule.scheduleJob({hour: 08, minute: 00}, () => {
    axios.get('https://api.fixer.io/latest')
        .then((response) => response.data)
        .then((data) => fx.rates = data.rates)
        .then(() => fx(1).from("USD").to("TRY"))
        .then((rate) => tweet(rate));
});

app.get('/', (req, res) => {
    res.send('Nerdesiniz.js');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});