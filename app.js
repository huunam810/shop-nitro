var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs  = require('express-handlebars');
var mongodb = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var bodyparser = require("body-parser");
var csrf = require('csurf');

mongodb.connect('mongodb://127.0.0.1:27017/shopping', { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
require('./config/passport');
require('./routes/user');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const orderRoutes = require("./routes/orders");
var aboutRoutes = require('./routes/about');
var productRoutes = require('./routes/product');
var xhrRoutes = require('./routes/xhr');

var app = express();


mongoose.Promise = global.Promise;
// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
var csrfProtection = csrf();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.urlencoded({
  extended: true
}));
app.use(bodyparser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret', 
  resave: false, 
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie: { maxAge: 180 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use('/admin',csrfProtection, adminRouter);
app.use('/user', csrfProtection, userRouter);
app.use('/', indexRouter);
app.use('/about', aboutRoutes);
app.use('/product', productRoutes);
app.use('/xhr', xhrRoutes);
app.use("/orders", orderRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});
module.exports = app;
