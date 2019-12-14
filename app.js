var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');
var passport = require('passport');
var passportSocketIo = require('passport.socketio');

var index = require('./routes/index');
var products = require('./routes/products');
var users = require('./routes/users');
var guideInfo = require('./routes/guideInfo');
var guide = require('./routes/guide');
var passportConfig = require('./lib/passport-config'); //passport 로그인
var app = express();
var ajax = require('./routes/ajax');
var admin = require('./routes/admin');

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');
  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }
  // Pug의 local에 moment라이브러리와 querystring 라이브러리를 사용할 수 있도록.
  app.locals.moment = require('moment');
  app.locals.querystring = require('querystring');

  //=======================================================
  // mongodb connect
  //=======================================================
  mongoose.Promise = global.Promise; // ES6 Native Promise를 mongoose에서 사용한다.
  const connStr = 'mongodb+srv://new-user_1:hj@1027612@web-09e2s.mongodb.net/test?retryWrites=true&w=majority' ;
  mongoose.connect(connStr, {useNewUrlParser: true });
  mongoose.connection.on('error', console.error);

  // Favicon은 웹사이트의 대표 아이콘입니다. Favicon을 만들어서 /public에 둡시다.
  // https://www.favicon-generator.org/ 여기서 만들어볼 수 있어요.
  app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(cookieParser());

  app.use(methodOverride('_method', {methods: ['POST', 'GET']}));

  app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    debug: true,
    sourceMap: true
  }));

  const sessionStore = new session.MemoryStore();
  const sessionId = 'mjoverflow.sid';
  const sessionSecret =  'mymymymymoney'
  // session을 사용할 수 있도록.
  app.use(session({
    name: sessionId,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    secret: sessionSecret
  }));

  app.use(flash()); // flash message를 사용할 수 있도록
  app.use(express.static(path.join(__dirname, 'public')));

  //=======================================================
  // Passport 초기화
  //=======================================================
  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);
  
  // pug의 local에 현재 사용자 정보와 flash 메시지를 전달하자.
  app.use(function(req, res, next) {
    res.locals.currentUser = req.user;  // passport는 req.user로 user정보 전달
    res.locals.flashMessages = req.flash();
    next();
  });
 

  //todo Socket 사용 보류

app.use('/', index);
app.use('/users', users);
app.use('/products',products);
require('./routes/auth')(app, passport);
app.use('/guideInfo',guideInfo);
app.use('/guide',guide);
app.use('/ajax', ajax);
app.use('/admin', admin);

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

module.exports = app;
