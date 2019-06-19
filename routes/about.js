var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('shop/about', {
        pageTitle: 'About',
        layout: false
    });
});

module.exports = router;
