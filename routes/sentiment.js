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
var tweetCount = 0;
var tweetTotalSentiment = 0;
var tweetAvgSentiment = null;
var tweetMaxSentiment = null;
var tweetMinSentiment = null;
var tweetPositiveWords = [];
var tweetNegativeWords = [];
var monitoringPhrase;
var stream;

// reset for new phrase monitoring
router.get('/reset', function (req, res) {

    resetMonitoring();

    var welcomeResponse = "<HEAD>" +
        "<link rel='stylesheet' type='text/css' href='http://localhost:5000/styles/style.css'>" +
        "<link rel='stylesheet' type='text/css' href='http://localhost:5000/styles/bootstrap.min.css'>" +
        "<title>Twitter Sentiment Analysis</title>\n" +
        "</HEAD>\n" +
        "<BODY>\n" +
        "<div class='jumbotron'>" +
        "<h1 class='display-3'>Sentiment Analysis using Twitter</h1>" +
        "<p class='lead'>This is a demonstration of AFINN-based sentiment analysis using Twitter as the data source. This demo " +
        "uses a Node.js library called <a href src='https://github.com/thisandagain/sentiment' target='blank'>sentiment</a> and " +
        "the Twitter API to search Twitter to find the general sentiment of a word or phrase. To see demonstration, please " +
        "enter a phrase into the text box below:</p>" +
        "<hr class='my-4'>" +
        "<p>Enter a word or phrase: </p>" +
        "<form action='/beginMonitoring' method='get'>\n" +
        "<fieldset>\n" +
        "<input type='text' name='phrase'><br><br>\n" +
        "<button type='submit' class='btn btn-primary'>How do people feel about this on Twitter?</button>" +
        "</fieldset></form></BODY>";

    res.send(welcomeResponse);

});

// begin monitoring twitter with requested phrase
router.get('/beginMonitoring', function (req, res) {

    // if monitoring phrase is empty reset
    if (monitoringPhrase) {
        resetMonitoring();
    }
    // phrase to monitor on Twitter
    monitoringPhrase = req.query.phrase;
    tweetCount = 0;
    tweetTotalSentiment = 0;

    // begin twitter stream using phrase
    stream = twitter.stream('statuses/filter', { track: monitoringPhrase });

    // evaluate each stream (will stream until reset is called)
    stream.on('data', function (data) {
        // only evaluate the sentiment of English-language tweets
        if (data.lang === 'en') {
            sentiment(data.text, function (err, result) {
                tweetCount++;
                tweetTotalSentiment += result.score;
                // determine max sentiment
                if (tweetMaxSentiment != null) {
                    if (tweetMaxSentiment < result.score) {
                        tweetMaxSentiment = result.score;
                    }
                }
                else {
                    tweetMaxSentiment = result.score;
                }
                // determine min sentiment
                if (tweetMinSentiment != null) {
                    if (tweetMinSentiment > result.score) {
                        tweetMinSentiment = result.score;
                    }
                }
                else {
                    tweetMinSentiment = result.score;
                }
                // collect positive & negative words 
                tweetPositiveWords.push(result.positive);
                tweetNegativeWords.push(result.negative);
                console.log("Total tweet sentiment: ", tweetTotalSentiment);
            });
        }
    });

    var monitoringResponse =
        "<HEAD>" +
        "<META http-equiv='refresh' content='5; URL=http://" + req.headers.host + "/'>" +
        "<link rel='stylesheet' type='text/css' href='http://localhost:5000/styles/style.css'>" +
        "<link rel='stylesheet' type='text/css' href='http://localhost:5000/styles/bootstrap.min.css'>" +
        "<title>Twitter Sentiment Analysis</title>\n" +
        "</HEAD>\n" +
        "<BODY>\n" +
        "<div class='jumbotron'>" +
        "<h1 class='display-3'>How is Twitter feeling about <span class='text-primary'>" + monitoringPhrase + "</span>?</h1>" +
        "<p class='lead'></p> " +
        "<div class='emoji'><image style='vertical-align:middle' src='/images/" + sentimentImage() + ".png'/><div>" + sentimentImage() + "</div></div>" +
        "<p class='display-3'>Based on " + tweetCount + " analyzed tweets...</p>" +
        "<hr class='my-4'>" +
        "<a class='btn btn-primary' href='/reset'>Monitor another phrase</a></BODY>";

    res.send(monitoringResponse);

    return stream;
});

// home page
router.get('/', function (req, res) {
    // if we are not monitoring a phrase then send the welcome page
    if (!monitoringPhrase) {
        // create welcome page
        var welcomeResponse = createWelcomPage();
        res.send(welcomeResponse);
    }
    // otherwise, send the monitoring page
    else {
        // create monitoring page
        var monitoringResponse = createMonitoringPage(req.headers.host);
        res.send(monitoringResponse);
    }
});

// create the welcome page
function createWelcomPage() {

    var welcome = "<HEAD>" +
        "<link rel='stylesheet' type='text/css' href='http://localhost:5000/styles/style.css'>" +
        "<link rel='stylesheet' type='text/css' href='http://localhost:5000/styles/bootstrap.min.css'>" +
        "<title>Twitter Sentiment Analysis</title>\n" +
        "</HEAD>\n" +
        "<BODY>\n" +
        "<div class='jumbotron'>" +
        "<h1 class='display-3'>Sentiment Analysis using Twitter</h1>" +
        "<p class='lead'>This is a demonstration of AFINN-based sentiment analysis using Twitter as the data source. This demo " +
        "uses a Node.js library called <a href src='https://github.com/thisandagain/sentiment' target='blank'>sentiment</a> and " +
        "the Twitter API to search Twitter to find the general sentiment of a word or phrase. To see demonstration, please " +
        "enter a phrase into the text box below:</p>" +
        "<hr class='my-4'>" +
        "<p>Enter a word or phrase: </p>" +
        "<form action='/beginMonitoring' method='get'>\n" +
        "<fieldset>\n" +
        "<input type='text' name='phrase'><br><br>\n" +
        "<button type='submit' class='btn btn-primary'>How do people feel about this on Twitter?</button>" +
        "</fieldset></form></BODY>";

    return welcome;
}

// create the monitoring page
function createMonitoringPage(host) {

    var monitoringResponse =
        "<HEAD>" +
        "<META http-equiv='refresh' content='5; URL=http://" + host + "/'>" +
        "<link rel='stylesheet' type='text/css' href='http://localhost:5000/styles/style.css'>" +
        "<link rel='stylesheet' type='text/css' href='http://localhost:5000/styles/bootstrap.min.css'>" +
        "<title>Twitter Sentiment Analysis</title>\n" +
        "</HEAD>\n" +
        "<BODY>\n" +
        "<div class='jumbotron'>" +
        "<h1 class='display-3'>How is Twitter feeling about <span class='text-primary'>" + monitoringPhrase + "</span>?</h1>" +
        "<p class='lead'></p> " +
        "<div class='emoji'><image style='vertical-align:middle' src='/images/" + sentimentImage() + ".png'/><div>" + sentimentImage() + "</div></div>" +
        "<p class='display-3'>Based on " + tweetCount + " analyzed tweets...</p>" +
        "<hr class='my-4'>" +
        "<a class='btn btn-primary' href='/reset'>Monitor another phrase</a><br><br>" +
        // results
        "<table class='table table-striped table-hover table-bordered'>" +
        "<thead class='thead-light'>" +
        "<tr><th>Total Sentiment</th><th>Maximum Sentiment</th><th>Minimum Sentiment</th><th>Average Sentiment</th></tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr class='table-info'><td>" + tweetTotalSentiment + "</td><td>" + tweetMaxSentiment + "</td><td>" + tweetAvgSentiment + "</td><td>" + tweetAvgSentiment + "</td></tr>" +
        "</tbody>" +
        "</table>" +
        "<table class='table table-striped table-hover table-bordered'>" +
        "<thead class='thead-light'>" +
        "<tr><th></th><th>Excited<image style='vertical-align:middle' src='/images/excited.png'/></th><th>Happy<image style='vertical-align:middle' src='/images/happy.png'/></th>" +
        "<th>Neutral<image style='vertical-align:middle' src='/images/neutral.png'/></th><th>Sad<image style='vertical-align:middle' src='/images/sad.png'/></th>" +
        "<th>Angry<image style='vertical-align:middle' src='/images/angry.png'/></th></tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr class='table-info'><td>Range</td><td>> 0.6</td><td>0.6 - 0.2</td><td>0.2 - (-0.2)</td><td>(-0.2) - (-0.6)</td><td> < (-0.6)</td></tr>" +
        "</tbody>" +
        "</table>" +
        "<table class='table table-striped table-hover table-bordered'>" +
        "<thead class='thead-light'>" +
        "<tr><th>Positive Words</th></tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr><td>";

    var cleanPositiveWords = processWords(tweetPositiveWords);
    for (var i = 0; i < cleanPositiveWords.length; i++) {
        monitoringResponse += "<span class='badge badge-pill badge-primary'>" + cleanPositiveWords[i] + "</span>";
    }
    monitoringResponse += "</td></tr></tbody></table><table class='table table-striped table-hover table-bordered'>" +
        "<thead class='thead-light'>" +
        "<tr><th>Negative Words (WARNING: words in this list can be Rated R)</th></tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr><td>";

    var cleanNegativeWords = processWords(tweetNegativeWords);
    for (var i = 0; i < cleanNegativeWords.length; i++) {
        monitoringResponse += "<span class='badge badge-pill badge-primary'>" + cleanNegativeWords[i] + "</span>";
    }
    monitoringResponse += "</td></tr></tbody></table></BODY>";

    return monitoringResponse;
}

// determine average sentiment and return appropriate image
function sentimentImage() {
    tweetAvgSentiment = tweetTotalSentiment / tweetCount;
    console.log("Average tweet sentiment: ", tweetAvgSentiment);
    if (tweetCount > 0) {
        // excited
        if (parseFloat(tweetAvgSentiment) > 0.6) {
            return "excited";
        }
        // happy
        else if (parseFloat(tweetAvgSentiment) > 0.2) {
            return "happy";
        }
        // neutral
        else if (parseFloat(tweetAvgSentiment) > -0.2) {
            return "neutral";
        }
        // sad
        else if (parseFloat(tweetAvgSentiment) > -0.6) {
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

// process word collected word array from Twitter and
// return list of unique single words
function processWords(words) {
    var cleanWords = [];
    for (var i = 0; i < words.length; i++) {
        var word = words[i].toString();
        var splitWord = word.split(',');
        for (var x = 0; x < splitWord.length; x++) {
            if (cleanWords.indexOf(splitWord[x]) < 0) {
                cleanWords.push(splitWord[x]);
            }
        }
    }
    return cleanWords;
}

// reset monitoring process & phrase
function resetMonitoring() {
    stream.destroy();
    monitoringPhrase = "";
}

module.exports = router;