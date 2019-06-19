var express = require('express');
var router = express.Router();
const Cart = require('../models/cart');

var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function (req, res, next) {
    var successMsg = req.flash('success')[0];
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 4;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/index', {title: 'Shopping Cart', products: productChunks, successMsg: successMsg, noMessages: !successMsg});
    });
});



 router.get('/types/:type', function (req, res, next) {
     var type = req.params.type;
     Product.find({type: type}, function (err, products) {
         var productType = [];
         var chunkSize = 4;
        for (var i = 0; i < products.length; i += chunkSize) {
         productType.push(products.slice(i, i + chunkSize));
        }
         res.render('shop/type',{type: productType});
    });
 });
 router.get('/types', (req, res) => {
    Product.find((err, docs) => {
        if (!err) {
            res.render("shop/type", {
                products: docs
            });
        }
        else {
            console.log('Error in retrieving employee list :' + err);
        }
    });
});
router.get('/add-to-cart/:id', function(req, res, next) {
    var productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
       if (err) {
           return res.redirect('/');
       }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});

router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});
router.get('/update/:id', function(req, res, next) {
    var productId = req.params.id;
    const cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.update(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});


router.get('/shopping-cart', function(req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null, layout: false});
    } 
    const cart = new Cart(req.session.cart);
     res.render('shop/shopping-cart', {
         products: cart.generateArray(), 
         totalPrice: cart.totalPrice,
         layout: false
        });
 });
 
 router.get('/checkout', isLoggedIn, function(req, res, next) {
     if (!req.session.cart) {
         return res.redirect('/shopping-cart');
     }
     const cart = new Cart(req.session.cart);
     const errMsg = req.flash('error')[0];
     res.render('shop/checkout', {
        total: cart.totalPrice, 
        errMsg: errMsg, 
        noError: !errMsg, 
        layout: false
        });
 });
 router.get('/thankyous', function(req, res, next) {
    res.render('ty', {
        layout: false
    });
});


router.post('/checkout', isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    const cart = new Cart(req.session.cart);
    
    const stripe = require("stripe")(
        "sk_test_chkB4fo21YshGfLxQ8v9bXjH00hkthQTjx"
    );

    stripe.charges.create({
        amount: cart.totalPrice * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge"
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        const order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function(err, result) {
            req.flash('success', 'Successfully bought product!');
            req.session.cart = null;
            res.redirect('/thankyous');
        });
    }); 
});

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}

