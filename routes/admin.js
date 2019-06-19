var mongoose = require('mongoose');
var async = require('async');
var passport = require('passport');
var express = require('express');
var router = express.Router();
var Product = mongoose.model('Product');
var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

router.get('/',isLoggedInAdmin, function(req, res, next) {
    res.render('dashboard', {
        pageTitle: 'Administrator Panel',
        layout: false
    });
});
router.get('/logout',isLoggedInAdmin, function(req, res, next) {
    req.logout();
    res.redirect('/admin/login');
});
router.get('/login',notLoggedInAdmin, function(req, res, next) {
    var messages = req.flash('error');
    res.render('admin', {
        pageTitle: 'Administrator Login',
        csrfToken: req.csrfToken(),
        messages: messages,
        hasErrors: messages.length > 0,
        layout: false
    });
});
router.post('/login', passport.authenticate('admin.login', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login',
    badRequestMesseage: 'Please input all fields required.',
    failureFlash: true
}));
router.use('/',  function(req, res, next) {
    next();
});

module.exports = router;

function isLoggedInAdmin(req, res, next) {
    if (req.user && req.user.roles === "ADMIN" && req.user.provider === "admin") {
        return next();
    } else {
        return res.redirect('/admin/login');
    }
};
function notLoggedInAdmin(req, res, next) {
    if (!req.user) {
        return next();
    } else {
        if (req.user && req.user.roles !== "ADMIN" && req.user.provider !== "admin") {
            return next();
        } else {
            return res.redirect('/admin');
        }
    }
}