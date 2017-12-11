
var twitterMonitor;
var monitorActive = false;
var maxRequests = 10;

// begin monitoring a Twitter phrase
function beginMonitoring(phrase) {
    var monitoringRequests = 0;
    twitterMonitor = null;
    monitorActive = true;

    // turn of the welcome page
    var welcomePage = document.getElementById("welcome");
    welcomePage.style.display = "none";
    // turn on the monitoring page
    var monitorPage = document.getElementById("monitor");
    document.getElementById("monitor-phrase").textContent = phrase;
    monitorPage.style.display = "block";
    // loop through and get twitter monitoring results
    function monitorTwitter() {
        setTimeout(function () {
            monitoringRequests++;
            var jqxhr = $.get("sentiment/monitorTwitter?phrase=" + phrase, function (monitor) {
                console.log("Phrase: ", monitor);
                monitorPage.innerHTML = createMonitoringPage(monitor, monitoringRequests);
            }).fail(function () {
                console.log("error");
            });
            console.log(monitoringRequests);
            if (monitoringRequests < maxRequests) {
                monitorTwitter();
            }
            else {
                monitorActive = false;
                // stop monitoring
                var jqxhr = $.get("sentiment/stopTwitter?phrase=" + phrase, function (monitor) {
                    console.log("Phrase: " + monitor.phrase);
                    monitorPage.innerHTML = createMonitoringPage(monitor, monitoringRequests);
                }).fail(function () {
                    monitorPage.innerHTML = createMonitoringPage("error", monitoringRequests);
                    console.log("error");
                });
            }
        }, 2000) // wait time between requests
    }

    monitorTwitter();
}

// create the monitoring page dynamically
function createMonitoringPage(monitor, monitoringRequests) {
    if (monitor) {
        if (monitor.phrase) {
            twitterMonitor = monitor;
        }
        else {
            twitterMonitor.twitter.active = false;
        }
    }

    var monitoringResponse =
        "<div class='jumbotron'>" +
        "<h1 class='display-3'>How is Twitter feeling about <span class='text-primary'>" + twitterMonitor.phrase + "</span>?</h1>" +
        "<p class='lead'></p> " +
        "<div class='emoji'><image style='vertical-align:middle' src='/images/" + twitterMonitor.twitter.image + ".png'/><div>" + twitterMonitor.twitter.image + "</div></div>";
    if (monitorActive) {
        var progress = (monitoringRequests / maxRequests) * 100;
        monitoringResponse += "<p class='display-3'>Searching tweets...</p>" +
            "<div class='progress'>" +
            "<div class='progress-bar progress-bar-striped progress-bar-animated' role='progressbar' aria-valuenow='" + monitoringRequests + "' aria-valuemin='0' aria-valuemax='" + maxRequests + "' style='width: " + progress + "%'></div></div>";
    }
    else {
        monitoringResponse += "<p class='display-3'>Search complete, analyzed " + twitterMonitor.twitter.count + " tweets.</p>";
    }
    monitoringResponse += "<hr class='my-4'>" +
        "<a class='btn btn-success' href='/'>Monitor another phrase</a><div class='request-count text-info'>Number of Twitter Searches: " + monitoringRequests + " of 10</div><br><br>" +
        // results
        "<table class='table table-striped table-hover table-bordered'>" +
        "<thead class='thead-light'>" +
        "<tr><th>Total Tweets Analyzed</th><th>Total Sentiment</th><th>Maximum Sentiment</th><th>Minimum Sentiment</th><th>Average Sentiment</th></tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr class='table-info'><td>" + twitterMonitor.twitter.count + "</td><td>" + twitterMonitor.twitter.total + "</td><td>" + twitterMonitor.twitter.max + "</td><td>" + twitterMonitor.twitter.min + "</td><td>" + twitterMonitor.twitter.avg + "</td></tr>" +
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

    var cleanPositiveWords = processWords(twitterMonitor.twitter.positive);
    for (var i = 0; i < cleanPositiveWords.length; i++) {
        monitoringResponse += "<span class='badge badge-pill badge-primary'>" + cleanPositiveWords[i] + "</span>";
    }
    monitoringResponse += "</td></tr></tbody></table><table class='table table-striped table-hover table-bordered'>" +
        "<thead class='thead-light'>" +
        "<tr><th>Negative Words (WARNING: words in this list can be Rated R)</th></tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr><td>";

    var cleanNegativeWords = processWords(twitterMonitor.twitter.negative);
    for (var i = 0; i < cleanNegativeWords.length; i++) {
        monitoringResponse += "<span class='badge badge-pill badge-primary'>" + cleanNegativeWords[i] + "</span>";
    }
    monitoringResponse += "</td></tr></tbody></table></BODY>";

    return monitoringResponse;
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

// initialization
// add listener to enter key on input box
function init() {
    document.getElementById("phrase").addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("monitor-button").click();
        }
    });
}