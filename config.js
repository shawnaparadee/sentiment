// config.js
// configuration file for all configuration settings for the API
// there settings in global.js and layout.jade
var config = {
    title: "Node Express API Broilerplate",
    subDirectory: {
        "production": "/api/", // based on pm2 alias
        "stage": "/stage-node-express-api/", // based on pm2 alias
        "local": "/"
    },
    // Port settings
    port: {
        "production": 8080,
        "stage": 8082,
        "local": 5000
    },
    // Twitter settings
    twitter: {
        "consumer_key": "iryZGnyltZO08H4XdtwVtCuWF",
        "consumer_secret": "sBq7ObZ5XPWSxsejsKTHvPusMO4h1kXl7KJupFnToxvfV55mfY",
        "access_token_key": "67132867-Dzum4T4OFoUkgYfaQY2NqZfniIEfO18VwQR0mE4Kz",
        "access_token_secret": "IgbW9GhS3rzAH36mDIw2jv4npgxhkROYyUlrolriFB48H"
    },
    auth: {
        secret: "blowfish_cypher_is_rad",
        expiresIn: "3h"
    }
};

// hostname constructor
config.hostname = function (relPath) {
    return window.location.protocol + "//" + window.location.host + "/" + relPath;
};

// API path constructor
config.apiPath = function (req, env) {
    if (req)
        return config.hostname(config.subDirectory[env] + req);
    else
        return config.hostname(config.subDirectory[env]);
};

module.exports = config;
