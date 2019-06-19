var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var cfgAuth = require('./auth');
var settings = require('../config/settings');

var provider = null;
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {

        var newUser = user.toObject();
        newUser['provider'] = provider;
        done(err, newUser);
    });
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    req.checkBody('firstname', 'Please input first name.').notEmpty();
    req.checkBody('lastname', 'Please input last name.').notEmpty();
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:6});
    req.checkBody('password', 'Confirm password is not the same, please check again.').equals(req.body.confirmpassword);

    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages)); 
    } 
    User.findOne({'local.email': email}, function(err, user) {
        if (err){
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'Email is already in use.'});
        }
        var newUser = new User();
            newUser.info.firstname = req.body.firstname;
            newUser.info.lastname = req.body.lastname;
            newUser.local.email = req.body.email;
            newUser.local.password = newUser.encryptPassword(password);
            newUser.newsletter = req.body.newsletter;
            newUser.roles = 'USER';
            // Nếu yêu cầu kích hoạt tài khoản qua email thì trạng thái tài khoản là INACTIVE
            newUser.status = (settings.confirmRegister == 1) ? 'INACTIVE' : 'ACTIVE';
            // newUser.firstname = firstname;
            // newUser.lastname = lastname;
            // newUser.email = email;
            // newUser.password = newUser.encryptPassword(password);
            newUser.save(function(err, result) {
                if(err) {
                    return done(err);
                }
                else {
                    // Nếu yêu cầu kích hoạt tài khoản qua email thì chỉ đăng ký mà không tự động đăng nhập
                    if (settings.confirmRegister == 1) {
                        return done(null, newUser);
                    } else {
                        // Tự động đăng nhập cho thành viên mới đăng ký khi không yêu cầu kích hoạt tài khoản qua email
                        req.logIn(newUser, function(err) {
                            provider = 'local';
                            return done(err, newUser);
                        });
                    }
                }
            });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    req.checkBody('email', 'Invalid email address, please try again.').notEmpty().isEmail();
    req.checkBody('password', 'Incorrect password, please try again.').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        var messages = [];
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages)); 
    }
    User.findOne({
        'local.email': email
    }, 
    function(err, user) {
        if (err){
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'No User Found.'});
        }
        if (!user.validPassword(password)) {
            return done(null, false, {message: 'Wrong Password.'});           
        }
        if (user.isInActivated(user.status)) {
            return done(null, false, {message: 'Your account is Inactive' });                          
        }

        if (user.isSuspended(user.status)) {
            return done(null, false, {message: 'Your account is Suspended'});                           
        }
        provider = "local";
        return done(null, user);
    });
}));

// Passport Facebook Login
passport.use(new FacebookStrategy({
    clientID: cfgAuth.facebookAuth.clientID,
    clientSecret: cfgAuth.facebookAuth.clientSecret,
    callbackURL: cfgAuth.facebookAuth.callbackURL,
    profileFields: cfgAuth.facebookAuth.profileFields,
    passReqToCallback: true
}, function(req, token, refreshTonken, profile, done) {

    // Check exist account
    User.findOne({
        'facebook.id': profile.id
    }, function(err, user) {
        if (err) {
            return done(err);
        }

        if (user) {
            provider = "facebook";
            return done(null, user);
        } else {
            // Link facebook to local account
            User.findOne({
                'local.email': profile.emails[0].value
            }, function(err, user) {

                if (err) {
                    return done(err);
                }

                if (user) {
                    // Update exist account
                    User.findOneAndUpdate({
                        'local.email': profile.emails[0].value
                    }, {
                        'facebook.id': profile.id,
                        'facebook.token': token,
                        'facebook.email': profile.emails[0].value,
                        'facebook.name': profile._json.first_name + ' ' + profile._json.last_name,
                        'facebook.photo': 'https://graph.facebook.com/v2.9/' + profile.id + '/picture?type=large'
                    }, {
                        new: true
                    }, function(err, user) {
                        if (err) {
                            return done(err);
                        }
                        provider = "facebook";
                        return done(null, user);
                    });
                } else {

                    // Link facebook to google account
                    User.findOne({
                        'google.email': profile.emails[0].value
                    }, function(err, user) {

                        if (err) {
                            return done(err);
                        }

                        if (user) {
                            // Update exist account
                            User.findOneAndUpdate({
                                'google.email': profile.emails[0].value
                            }, {
                                'facebook.id': profile.id,
                                'facebook.token': token,
                                'facebook.email': profile.emails[0].value,
                                'facebook.name': profile._json.first_name + ' ' + profile._json.last_name,
                                'facebook.photo': 'https://graph.facebook.com/v2.9/' + profile.id + '/picture?type=large'
                            }, {
                                new: true
                            }, function(err, user) {
                                if (err) {
                                    return done(err);
                                }
                                provider = "facebook";
                                return done(null, user);
                            });
                        } else {
                            // add new account with facebook info
                            var newUser = new User();
                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.email = profile.emails[0].value;
                            newUser.facebook.name = profile._json.first_name + ' ' + profile._json.last_name;
                            newUser.facebook.photo = 'https://graph.facebook.com/v2.9/' + profile.id + '/picture?type=large';
                            newUser.roles = "User";
                            newUser.status = "ACTIVE";
                            newUser.save(function(err) {
                                if (err) {
                                    return done(err);
                                }
                                provider = "facebook";
                                return done(null, newUser);
                            });
                        }
                    });
                    
                }
            });

        }
    });
}));


// Passport Google Login
passport.use(new GoogleStrategy({
    clientID: cfgAuth.googleAuth.clientID,
    clientSecret: cfgAuth.googleAuth.clientSecret,
    callbackURL: cfgAuth.googleAuth.callbackURL,
    passReqToCallback: true
}, function(req, token, refreshTonken, profile, done){

    //check exist account
    User.findOne({
        'google.id': profile.id
    }, function(err, user) {
        if (err) { 
            return done(err);
        }

        if (user) {
            provider = "google";
            return done(null, user);
        } else {

            User.findOne({
                'local.email': profile.emails[0].value
            }, function(err, user) {
                if (err) {
                    return done(err);
                }

                if (user) {
                    //Link google account to local account
                    User.findOneAndUpdate({
                        'local.email': profile.emails[0].value
                    }, {
                        'google.id': profile.id,
                        'google.token': token,
                        'google.name': profile.displayName,
                        'google.email': profile.emails[0].value,
                        'google.photo': profile.photos[0].value
                    }, {
                        new: true
                    }, function(err, user) {
                        if (err) {
                            return done(err);
                        }
                        provider = "google";
                        return done(null, user);
                    });
                } else {
                    User.findOne({
                        'facebook.email': profile.emails[0].value
                    }, function(err, user) {
                        if (err) {
                            return done(err);
                        }
        
                        if (user) {
                            //Link google account to local account
                            User.findOneAndUpdate({
                                'facebook.email': profile.emails[0].value
                            }, {
                                'google.id': profile.id,
                                'google.token': token,
                                'google.name': profile.displayName,
                                'google.email': profile.emails[0].value,
                                'google.photo': profile.photos[0].value
                            }, {
                                new: true
                            }, function(err, user) {
                                if (err) {
                                    return done(err);
                                }
                                provider = "google";
                                return done(null, user);
                            });
                        } else {
                            //Add new account using google email
                            var newUser = new User();
                            newUser.google.id = profile.id;
                            newUser.google.token = token;
                            newUser.google.name = profile.displayName;
                            newUser.google.email = profile.emails[0].value;
                            newUser.google.photo = profile.photos[0].value;
                            newUser.roles = "USER";
                            newUser.status = "ACTIVE";
                            newUser.save(function(err) {
                                if (err) { return done(err); }
                                provider = "google";
                                return done(null, newUser);
                            });
                        }
        
                    });
                }

            });

        }
    });

}));

 // Passport Admin
 passport.use('admin.login', new LocalStrategy({
     usernameField: 'email',
     passwordField: 'password',
     passReqToCallback: true
 }, function(req, email, password, done) {

     req.checkBody('email', 'Email address is invalid, please check again').notEmpty().isEmail();
     req.checkBody('password', 'Please input your password').notEmpty();

     var errrors = req.validationErrors();

     if (errrors) {
         var messages = [];
         errrors.forEach(function(error) {
             messages.push(error.msg);
         });
         return done(null, false, req.flash('error', messages));
     }

     // Find User
     User.findOne({
         'local.email': email
     }, function(err, user) {
         if (err) 
             return done(err);
        
         if (!user) {
             return done(null, false, {
                 message: 'This account not exist, please check again.'
             });
         }

         if (!user.validPassword(password)) {
             return done(null, false, {
                 message: 'Your password invalid, please reinput.'
             });
         }


         if (!user.isGroupAdmin(user.roles)) {
             return done(null, false, {
                 message: 'You haven\'t permission login to administrator panel, please goback home page.'
             });
         }

         if (user.isInActivated(user.status)) {
             return done(null, false, {
                 message: 'Your account not activated.'
             });
         }

         if (user.isSuspended(user.status)) {
             return done(null, false, {
                 message: 'Your account is locked.'
             });
         }

         provider = "admin";
         return done(null, user);

     });
 }));