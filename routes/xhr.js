var express = require('express');
var router = express.Router();
var Product = require("../models/product");


router.get('/search', function(req, res){
    var q = req.query.q ;
    console.log(q)

    Product.find({
        title: {
            $regex: new RegExp(q)
        }
    }, {
        _id: 0,
        __v: 0
    }, function(err, data) {
        res.json(data);
        console.log(data);
    }).limit(10);
    
    // Product.find({
    //     $text: {
    //         $search: new RegExp(q)
    //     }
    // }, {
    //     _id: 0,
    //     __v: 0
    // }, function(err, data) {
    //     res.json(data);
    //     console.log(data);
    // });
});
module.exports = router;