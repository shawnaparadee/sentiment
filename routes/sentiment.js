var express = require('express');
var sentiment = require('sentiment');
var Twitter = require('twitter');
var router = express.Router();

// get the applications configuration
var config = require("../config.js");

// twitter authentication
var twitter = new Twitter({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token_key: config.twitter.access_token_key,
    access_token_secret: config.twitter.access_token_secret
});

// information to collect per phrase
var tweetCount = 0; // number of tweets 
var tweetMaxSearches = 7; // number of searches to allow before destroy (otherwise it just keeps going even after user has left page)
var tweetSearches = 1; // number of searches returned for a phrase
var tweetTotalSentiment = 0; // total sentiment value
var tweetAvgSentiment = null; // average sentiment (total / count)
var tweetMaxSentiment = null; // max sentiment value
var tweetMinSentiment = null; // min sentiment value
var tweetPositiveWords = []; // positive words from tweets use in sentiment calulation
var tweetNegativeWords = []; // negative words from tweets use in sentiment calulation
var monitoringPhrase; // phrase to search Twitter
var stream; // the Twitter stream
var searching = false; // the Twitter stream is active


var twitterMonitors = [];

// reset for new phrase monitoring
router.get('/stopTwitter', function (req, res) {
    console.log("Call to STOP twitter: " + req.query.phrase);
    twitterMonitors.forEach(function (monitor, index) {
        console.log("Existing phrases: " + monitor.phrase);
        if (monitor.phrase === req.query.phrase) {
            console.log("    Found twitter: " + req.query.phrase);
            monitor.twitter.stream.destroy();
            console.log("    Removing index: " + index);
            twitterMonitors = twitterMonitors.splice(index, 0);
        }
    });

    res.send("     Successful stop...");

});


// begin monitoring twitter with requested phrase
router.get('/monitorTwitter', function (req, res) {
    console.log("Call to monitor twitter: " + req.query.phrase);
    var monitor = null;
    twitterMonitors.forEach(function (m) {
        console.log("Existing phrases: " + m.phrase);
        if (m.phrase === req.query.phrase) {
            console.log("     Monitor exists...");
            monitor = m;
        }
    });
    // monitor exists
    if (monitor) {
        processMonitor(monitor);
    }
    // monitor does not exist
    else {

        var twitterMonitor = {
            count: 0, // number of tweets 
            total: 0, // total sentiment value
            avg: 0, // average sentiment (total / count)
            max: 0, // max sentiment value
            min: 0, // min sentiment value
            positive: [], // positive words from tweets use in sentiment calulation
            negative: [], // negative words from tweets use in sentiment calulation
            coordinates: [], // array of coordinates
            locations: [], // array of user locations
            stream: null, // the Twitter stream
            active: true, // the Twitter stream is active
            image: "thinking" // the sentiment image
        };

        console.log("     Creating new monitor...");
        // create new monitor
        monitor = { phrase: req.query.phrase, twitter: twitterMonitor };
        twitterMonitors.push(monitor);

        // begin twitter stream using phrase
        monitor.twitter.stream = twitter.stream('statuses/filter', { track: monitor.phrase });

        // evaluate each stream (will stream until reset is called)
        monitor.twitter.stream.on('data', function (data) {
            // only evaluate the sentiment of English-language tweets
            if (data.lang === 'en') {
                sentiment(data.text, function (err, result) {
                    twitterMonitor.count++;
                    twitterMonitor.total += result.score;
                    // determine max sentiment
                    if (twitterMonitor.max != null) {
                        if (twitterMonitor.max < result.score) {
                            twitterMonitor.max = result.score;
                        }
                    }
                    else {
                        twitterMonitor.max = result.score;
                    }
                    // determine min sentiment
                    if (twitterMonitor.min != null) {
                        if (twitterMonitor.min > result.score) {
                            twitterMonitor.min = result.score;
                        }
                    }
                    else {
                        twitterMonitor.min = result.score;
                    }
                    // collect coordinates
                    if (data.coordinates) {
                        twitterMonitor.coordinates = data.coordinates;
                    }
                    // collect location
                    if (typeof data.user.location != 'undefined') {
                        if (data.user.location != null) {
                            twitterMonitor.locations.push(data.user.location);
                        }
                    }
                    // collect positive & negative words 
                    twitterMonitor.positive.push(result.positive);
                    twitterMonitor.negative.push(result.negative);
                    processMonitor(monitor);
                });
            }
        });
    }

    var json = JSON.stringify(monitor);
    res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(json) });
    res.end(json);

    return monitor.twitter.stream;
});

function processMonitor(monitor) {
    monitor.twitter.image = sentimentImage(monitor.twitter);
}


// determine average sentiment and return appropriate image
function sentimentImage(monitor) {
    monitor.avg = monitor.count > 0 ? monitor.total / monitor.count : 0;
    if (monitor.count > 0) {
        // excited
        if (parseFloat(monitor.avg) > 0.6) {
            return "excited";
        }
        // happy
        else if (parseFloat(monitor.avg) > 0.2) {
            return "happy";
        }
        // neutral
        else if (parseFloat(monitor.avg) > -0.2) {
            return "neutral";
        }
        // sad
        else if (parseFloat(monitor.avg) > -0.6) {
            return "sad";
        }
        // angry
        else {
            return "angry";
        }
    }
    else {
        // thinking
        return "thinking";
    }
}

// object clone with js
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

module.exports = router;