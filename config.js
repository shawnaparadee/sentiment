// config.js
// configuration file for all configuration settings for the API
// there settings in global.js and layout.jade
var config = {
    title: "Node Express API Broilerplate",
    subDirectory: {
        "production": "/sentiment/", // based on pm2 alias
        "local": "/"
    },
    // Port settings
    port: {
        "production": 8085,
        "local": 5000
    },
    // URL settings
    url:{
        "production": 'http://api.v10.investmentmapping.org',
        "local": "http://localhost"
    },
    // Twitter settings
    twitter: {
        "consumer_key": "iryZGnyltZO08H4XdtwVtCuWF",
        "consumer_secret": "sBq7ObZ5XPWSxsejsKTHvPusMO4h1kXl7KJupFnToxvfV55mfY",
        "access_token_key": "67132867-Dzum4T4OFoUkgYfaQY2NqZfniIEfO18VwQR0mE4Kz",
        "access_token_secret": "IgbW9GhS3rzAH36mDIw2jv4npgxhkROYyUlrolriFB48H"
    }
};

module.exports = config;
