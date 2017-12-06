// Node Express API Broilerplate

// Declarations
var app; // application
var config; // application configuration information
// package variables
var express; // web framework for node ( https://expressjs.com/en/4x/api.html )
var path;
var favicon; // middleware for serving a favicon
var logger; // HTTP request logger
var cookieParser; // cookie parsing with signatures
var pg;  //postgresql connection
var bodyParser; // body parsing middleware
var requestIp; // get client ip addresses
var environment = 'production'; // default environment
// route variables
var sentiment;

var debug = require('debug')('sentiment-demo');
var args = process.argv.slice(2);

// load the application configuration file (config.js)
try {
    config = require('./config.js');
} catch (e) {
    console.log("No config.js file detected in root. This file is required.");
    process.exit(1);
}

// determine the target environment (first parameter passed to node)
// example: $ node api.js local
if (args.length > 0) {
    switch (args[0]) {
        case 'local':
            environment = 'local';
            break;
        default:
            environment = 'production';
            break;
    }
}
// determine the target environment (parameter passed by pm2)
if (process.env.NODE_ENV) {
    switch (process.env.NODE_ENV) {
        case 'local':
            environment = 'local';
            break;
        default:
            environment = 'production';
            break;
    }
}
console.log('Environment set to: ' + environment);

// load the packages we need (package.json)
try {
    express = require("express");
    path = require('path');
    favicon = require('serve-favicon');
    logger = require('morgan');
    cookieParser = require('cookie-parser');
    pg = require('pg');
    bodyParser = require('body-parser');
    requestIp = require('request-ip');
    app = express();
    var expressJwt = require('express-jwt');
    var unless = require('express-unless');
} catch (e) {
    console.log("An error occurred during the loading of the packages. Please " +
        "check to ensure all the packages listed in the package.json file are installed (nvm). Error: " + e);
    process.exit(1);
}
// load the routes, each route has a file in the routes folder
try {
    homepage = require('./routes/homepage');
    sentiment = require('./routes/sentiment');

} catch (e) {
    console.log("An error occurred during the loading of the routes. Please " +
        "ensure all route files referenced are available in the ./routes folder. " +
        "Error message: " + e.message);
    process.exit(1);
}
// set the application settings
try {
    // title
    app.set('title', config.title);
    app.set('trust proxy', 'loopback');

} catch (e) {
    console.log("An error occurred during the loading of the application settings." +
        "Error message: " + e.message);
    process.exit(1);
}
// connect the packages to the application (mount middleware)
try {
    app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use('/images', express.static(path.join(__dirname, 'images')));
    app.use('/styles', express.static(path.join(__dirname, 'styles')));

    // Add headers
    app.use(function (req, res, next) {

        // Websites to provide access to the API
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Request methods to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });

} catch (e) {
    console.log("An error occurred during the mounting of the application middleware. " +
        "Error message: " + e.message);
    process.exit(1);
}

// set the routes
try {
    app.use('/', sentiment);
} catch (e) {
    console.log("An error occurred while setting the routes. " +
        "Error message: " + e.message);
    process.exit(1);
}

console.log('Magic happens on port ' + config.port[environment]);

app.listen(config.port[environment]);

