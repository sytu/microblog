var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var settings = require("./settings");
var flash = require("connect-flash");


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: settings.cookie_secret,
    store: new MongoStore({ 
      db: settings.db,
      host: settings.host,
      port: settings.port,
      url: 'mongodb://localhost/' })
}));

app.use(flash());  //该段得放置于下一段，也就是使用了flash方法的代码段前

app.use(function(req,res,next){  //也许是因为异步特性，这段use得放在雨router段之前
    console.log("app.usr local");
    res.locals.user = req.session.user; 
    res.locals.post = req.session.post;
    var error = req.flash('error');
    res.locals.error = error.length?error:null; 

    var success = req.flash('success');
    res.locals.success = success.length?success:null;

    next();
});

app.use('/', routes);
app.use('/users', users);



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

app.listen(8888);

module.exports = app;




