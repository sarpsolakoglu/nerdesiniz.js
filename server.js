require('dotenv').config()
const axios = require('axios');
const fx = require('money');
const twit = require('twit');
const schedule = require('node-schedule');
const express = require('express');
const fs = require('fs');

const port = process.env.PORT || 3000;

var app = express();

const nerdesiniz = 'Gezi zamanı Dolar 1.92 oldu diye vatan haini diyenler şimdi Dolar %s, nerdesiniz?';

var T = new twit({
    consumer_key:         process.env.T_CONSUMER_KEY,
    consumer_secret:      process.env.T_CONSUMER_SECRET,
    access_token:         process.env.T_ACCESS_TOKEN,
    access_token_secret:  process.env.T_ACCESS_TOKEN_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});
  
var executeTweet = () => {
    getText()
        .then((tweetText) => tweet(tweetText))
        .then((dataString) => logToFile(dataString))
        .catch((errorMessage) => logToFile(errorMessage));
};

var getText = () => {
    return axios.get('https://api.fixer.io/latest')
        .then((response) => response.data)
        .then((data) => fx.rates = data.rates)
        .then(() => fx(1).from("USD").to("TRY"))
        .then((rate) => nerdesiniz.replace('%s', rate.toFixed(4)));
}

var tweet = (tweetText) => {
    return new Promise((resolve, reject) => {
        T.post('statuses/update', { status: tweetText }, function(err, data, response) {
            if (err) {
                reject(err.message);
            } else {
                resolve(JSON.stringify(data));
            }
        });
    });
}

var logToFile = (message) => {
    fs.writeFile('server.log', message + '\n', (err) => {
        if (err) {
            console.log("Couldn't log to file");
        }
    });
}

schedule.scheduleJob({hour: 21, minute: 53}, () => {
    executeTweet();
});

app.get('/', async (req, res, next) => {
    try {
        var nerdesinizText = await getText();
        res.send({
            nerdesinizText 
        });
    } catch (e) {
        next(e);
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});