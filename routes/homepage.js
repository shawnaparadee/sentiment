var express = require('express');
var router = express.Router();

/* GET help page. */
router.get('/', function (req, res) {
    res.render('homepage', { title: 'Node Express API Broilerplate - Help Pages' });
});

module.exports = router;
