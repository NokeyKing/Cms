var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 编辑器
var ueditor = require("ueditor");

var routes = require('./routes/index');
var admin = require('./routes/admin');

// session会话
var session = require('express-session');

var app = express();

// session
app.use(session({
    secret: 'nokeyCMS',
    resave: false,
    saveUninitialized: true
}));

// view engine setup
//设置模板引擎的位置和格式
app.set('views', path.join(__dirname, 'views/admin'));
app.set('view engine', 'ejs');

// 编辑器
app.use("/admin/ueditor/ue", ueditor(path.join(__dirname, 'public'), function (req, res, next) {
  // ueditor 客户发起上传图片请求
  if (req.query.action === 'uploadimage') {
    var foo = req.ueditor;

    var imgname = req.ueditor.filename;

    var img_url = '/admin/images/ueditor/';
    res.ue_up(img_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
    res.setHeader('Content-Type', 'text/html');//IE8下载需要设置返回头尾text/html 不然json返回文件会被直接下载打开
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage') {
    var dir_url = '/admin/images/ueditor/';
    res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
  }
  // 客户端发起其它请求
  else {
    // console.log('config.json')
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/admin/ueditor/nodejs/config.json');
  }
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//使用中间件来返回成功和失败的信息(需要写在路由管理的上面)
/*app.use(function(req,res,next){
  res.locals.user = req.session.user;
  var err = req.session.error;
  delete req.session.error;
  res.locals.message = "";
  if(err){
    res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
  }
  next();
});*/
app.use(function(req, res, next){
  //声明变量
  var err = req.session.error
      , msg = req.session.success;
  //删除会话中原有属性
  delete req.session.error;
  delete req.session.success;
  //将错误和正确信息存放到动态试图助手变量中。
  res.locals.message = '';
  if (err) res.locals.message = '<div class="alert alert-info">' + err + '</div>';
  if (msg) res.locals.message = '<div class="alert alert-info">' + msg + '</div>';
  next();
});
// 路由控制
app.use('/', routes);
app.use('/admin', admin);

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
