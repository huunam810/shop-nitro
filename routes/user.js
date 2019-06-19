const express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var router = express.Router();
var passport = require('passport');
var ObjectId = require('mongodb').ObjectId;

var User = mongoose.model('User');
var User = require('../models/user');

var Order = require('../models/order');
var Cart = require('../models/cart');

router.get('/profile', isLoggedIn, function (req, res, next) {
    Order.find({user: req.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', { 
            orders: orders,
            layout: false 
        });
    });
});




router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.get('/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', {
        csrfToken: req.csrfToken(), 
        messages: messages, 
        layout: false,
        hasErrors: messages.length > 0});
        
});

router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: '/user/signup',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('user/profile');
    }
});

router.get('/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', {
        csrfToken: req.csrfToken(), 
        layout: false,
        messages: messages, 
        hasErrors: messages.length > 0});
        
});

router.post('/signin', passport.authenticate('local.signin', {
    failureRedirect: '/user/signin',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('user/profile');
    }
});

/* GET Facebook Login */
router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email, public_profile']
}));
/* GET Facebook callback Login  */
router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin'
}));
/* GET Google Login */
router.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));
/* GET Google callback Login  */
router.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin'
}));


router.get('/', (req, res) => {
    res.render("user/user_add", { 
        layout: false,
        csrfToken: req.csrfToken(),
        viewTitle: "Insert Employee"
    });
});
router.post('/',(req, res) => {
   if (req.body._id == '')
       insertUser(req, res);
       else
       updateUser(req, res);
});
function insertUser(req, res, next) {
    console.log("========================================");
	var user = new User();
    user.lastname  = req.body.lastname ;
    user.roles = req.body.roles;
    user.email = req.body.email;
    user.satatus = req.body.satatus;
	user.save((err, doc) => {
		if (!err)
		res.redirect('user/add');
		else {
			if (err.name == 'ValidationError') {
				handleValidationError(err, req.body);
				res.render("user/user_add", {
					viewTitle: "Insert User",
                    message: "Created user successfully",
                    layout: false,
                    csrfToken: req.csrfToken(),
					user: req.body
				});
			}
			else
				console.log('Error during record insertion : ' + err);
		}
	});
 }
 function updateUser(req, res) {
     console.log(req.body)
    User.findOneAndUpdate({ _id: req.body._id },{
        info: {
            firstname: req.body.firstname,
            lastname: req.body.lastname
        },
        roles: req.body.roles,
        status: req.body.status
    }, { new: true }, (err, doc) => {
        if (!err) { res.redirect('user/add'); }
       else {
           if (err.name == 'ValidationError') {
               handleValidationError(err, req.body);
               res.render("user/user_add", {
                   viewTitle: 'Update User',
                   message: "Updated user successfully",
                   layout: false,
                   csrfToken: req.csrfToken(),
                   user: req.body
               });
           }
           else
               console.log('Error during record update : ' + err);
       }
   });
}
 router.get('/add', (req, res) => {
    User.find((err, docs) => {
        if (!err) {
            res.render("user/user_list", {
                user: docs,
                layout: false,
                csrfToken: req.csrfToken()
            });
        }
        else {
            console.log('Error in retrieving employee list :' + err);
        }
    });
});
router.get('/:id', (req, res) => {
	User.findById(req.params.id, (err, doc) => {
       if (!err) {
           res.render("user/user_add", {
               layout: false,
               csrfToken: req.csrfToken(),
               user : doc
           });
       }
   });
});
router.get('/delete/:id', (req, res) => {
   User.findByIdAndRemove({ _id: req.params.id }, (err, doc) => {
       if (!err) {
           res.redirect('/user/add');
       }
       else { console.log('Error in Product delete :' + err); }
   });
});
function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'imagePath':
                body['imagePathError'] = err.errors[field].message;
                break;
            case 'title':
                body['titleError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

