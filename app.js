var createError = require('http-errors');
var express = require('express');
var sequelize = require('./models/index.js').sequelize;
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const cors = require("cors");
//일회성(휘발성) 데이터를 특정 페이지(뷰)에 전달하는 방식제공 플래시 패키지 참조
var flash = require('connect-flash');


// express기반 서버세션 관리 팩키지 참조하기 
var session = require('express-session');

// 패스포트 패키지 참조하기 
const passport = require('passport');

// 인증관련 패스포트 개발자 정의 모듈참조,로컬로그인전략적용
const passportConfig = require('./passport/index.js');

// 패스포트 설정처리
passportConfig(passport);



var sequelize = require('./models/index.js').sequelize;

var indexRouter = require('./routes/index');
var articlesRouter = require('./routes/articles');
var channelRouter = require('./routes/channel');
var membersRouter = require('./routes/members');
var messageRouter = require('./routes/message');
var adminRouter = require('./routes/admin');

var app = express();

// flash 미들웨어 등록
app.use(flash());

sequelize.sync();

//express-session기반 서버세션 설정 구성하기 
app.use(
  session({
    resave: false, //매번 세션 강제 저장
    saveUninitialized: true, 
    secret: "testsecret", //암호화할떄 사용하는 salt값
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge:1000 * 60 * 20 //20분동안 서버세션을 유지하겠다.(1000은 1초)
    },
  }),
);

// 패스포트-세션 초기화
app.use(passport.initialize());
app.use(passport.session());  

// 모든 RESTFUL 호출에 대한 응답 허락하기 - CORS ALL 허락..
app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('layout', 'layout');
// app.set('layout', 'loginLayout');

app.set("layout extractScripts", true); 
app.set("layout extractStyles", true); 
app.set("layout extractMetas", true); 
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/views/src/assets'));

app.use('/', indexRouter);
app.use('/articles', articlesRouter);
app.use('/channel', channelRouter);
app.use('/members', membersRouter);
app.use('/message', messageRouter);
app.use('/admin', adminRouter);

app.use(session({
  secret: 'lee',  
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' }  
}));

// 패스포트-세션 초기화 : express session 뒤에 설정
app.use(passport.initialize());
app.use(passport.session());




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
