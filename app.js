var express = require('express');
var load = require('express-load');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var less = require('less-middleware');

var app = express();

global.app_key = 'V29UWeZjXWa300ODLJvw4id8gFnCKa8j';
global.api_url = 'http://greenhug-api.herokuapp.com';
//global.api_url = 'http://localhost:8000';
global.mashape_key = 'UtXb3fzVeemshVrjdBHyZUKqJBivp1LxfKpjsn4sxj4HtJz1Ww';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('keyboard cat'));
app.use(session({
    cookie: { maxAge: 60000 },
    saveUninitialized: true,
    secret: 'keyboard cat',
    resave: false
}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(less(__dirname + '/public/less/',{
    force: true,
    yuicompress: true,
    debug: true,
    dest: __dirname + '/public'
}));

load('models')
    .then('controllers')
    .then('routes')
    .into(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
