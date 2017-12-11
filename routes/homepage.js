var express = require('express');
var router = express.Router();

/* GET help page. */
router.get('/', function (req, res) {
    res.sendFile('public/index.html');
});

module.exports = router;
