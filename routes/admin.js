/**
 * Created by wy on 16/8/22.
 */
var express = require('express');
var router = express.Router();
// 文件管理
var fs = require("fs");
// 上传模块
var multiparty = require('multiparty');

// 链接数据库
require('../models/db');

// 数据库
// 后台注册
var modelCollections = require('../models/collections');
// 用户
var users = modelCollections.users;
// 类别
var category = modelCollections.category;
// 文章
var article = modelCollections.article;
// 上传
var upload = modelCollections.upload;

// md5加密
var crypto = require("crypto");


/****************************************路由**********************************************/
// 首页
router.get('/', function(req, res, next) {
    if(req.session.user){
        console.log(req.session);
        res.render('admin',{title:'首页',user:{name:req.session.user.username}});
    } else {
        //res.render('admin',{title:'首页',user:null});
        res.redirect('/admin/login/');
    }

});
/********************接口*********************/
router.get('/testInterface', function(req, res, next) {
    res.render('testInterface',{title:'测试接口'});
});
router.get('/testNg1', function(req, res, next) {
    res.render('testNg1',{title:'测试接口'});
});
router.get('/interface', function(req, res, next) {
    console.log('访问接口了');
    var a = '从接口返回的数据';
    res.send(a);
});
/********************上传*********************/
// 上传列表
router.get('/uploadList', function(req, res, next) {
    if (req.session.user){
        upload.find(function (err,docs) {
            res.render('uploadList',{title:'上传列表', user:{name:req.session.user.username}, uploadData:docs});
        });
    } else {
        res.redirect("/admin/login");
    }
});
// 添加上传
router.get('/addUpload', function(req, res, next) {
    if (req.session.user){
        res.render('addUpload',{title:'添加上传',user:{name:req.session.user.username}});
    } else {
        res.redirect("/admin/login");
    }
}).post('/addUpload', function(req, res, next) {
    //生成multiparty对象，并配置上传目标路径
    var form = new multiparty.Form({uploadDir: './public/files/'});
    //上传完成后处理
    form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files,null,2);
        if(err){
            req.session.error = '上传失败';
            res.redirect("/admin/addUpload");
        } else {
            // console.log('parse files: ' + filesTmp);
            var inputFile = files.upload[0];
            /*var Year = new Date().getFullYear();
            var Month = new Date().getMonth() + 1;
            var date = new Date().getDate();*/
            var uploadedPath = './' + inputFile.path;
            var dstPath = './public/files/' + inputFile.originalFilename;
            var useUrl = '/files/' + inputFile.originalFilename;
            //重命名为真实文件名
            fs.rename(uploadedPath, dstPath, function(err) {
                if(err){
                    console.log('rename error: ' + err);
                    req.session.error = '上传失败';
                } else {
                    console.log('rename ok');
                    req.session.success = '上传成功';

                    var newUpload = new upload({
                        title:fields.uploadTitle[0],
                        url:dstPath,
                        urlUse:useUrl,
                        person:req.session.user.username
                    });
                    //如果不存在则添加用户
                    newUpload.save(function(err,docs){
                        if(err){
                            console.log("存储失败");
                            req.session.error = '存储失败';
                        }
                        console.log("存储成功");
                        req.session.success = '存储成功';
                        res.redirect("/admin/addUpload");
                    })
                }
            });
        }
    });
});
// 删除上传
router.get('/delUpload/:mark', function (req,res,next) {
    var mark = req.params.mark;
    if(req.session.user){
        upload.findByIdAndRemove(mark , function (err,docs) {
            console.log(docs);
            req.session.error = '删除成功';
            res.redirect("/admin/uploadList/");
        });
    } else {
        res.redirect('/admin/login/');
    }

});
/********************文章*********************/
// 文章列表
router.get('/ArticleList', function (req,res,next) {
    if(req.session.user){
        article.find(function (err,docs) {
            res.render('articleList',{
                title:'文章列表',
                user:{name:req.session.user.username},
                articleList:docs
            });
        });
    } else {
        res.redirect('/admin/login/');
    }
});

// 添加文章
router.get('/addArticle', function (req,res,next) {
    if(req.session.user){
        category.find(function (err,docs) {
            res.render('addArticle',{
                title:'添加文章',
                user:{name:req.session.user.username},
                categoryList:docs
            });
        });
    } else {
        res.redirect('/admin/login/');
    }

}).post('/addArticle', function (req,res,next) {
    // 实例化类别对象
    var articleNew = new article({
        img:req.body.articleImg,
        title : req.body.articleTitle,
        content:req.body.articleContent,
        categoryId:req.body.articleCategory,
        des:req.body.articleDes,
        keywords:req.body.articleKeywords,
        issue:req.body.articleIsUse,
        person:req.session.user.username
    });
    articleNew.save(function(err,doc){
        console.log(doc);
        console.log(req.session);
        req.session.success = '文章添加成功';
        res.redirect('/admin/addArticle/');
    });
});

// 修改类别
router.get('/editArticle/:mark', function (req,res,next) {
    var mark = req.params.mark;
    if(req.session.user){
        category.find(function (err,docs) {
            article.findById( mark , function (err,docOne) {
                res.render('editArticle',{title:'修改文章',user:{name:req.session.user.username}, categoryList:docs,articleOne:docOne,categorySelf:mark});
            });
        });
    } else {
        res.redirect('/admin/login/');
    }

}).post('/editArticle/:mark', function (req,res,next) {
    var mark = req.params.mark;
    var orderbyData = req.body.categoryOrderby ? req.body.categoryOrderby : '100';
    var data = {
        img:req.body.articleImg,
        title : req.body.articleTitle,
        content:req.body.articleContent,
        categoryId:req.body.articleCategory,
        des:req.body.articleDes,
        keywords:req.body.articleKeywords,
        issue:req.body.articleIsUse,
        person:req.session.user.username
    };
    article.findByIdAndUpdate(mark , data, function (err,doc) {
        res.redirect('/admin/articleList/');
    });
});

// 删除文章
router.get('/delArticle/:mark', function (req,res,next) {
    var mark = req.params.mark;
    if(req.session.user){
        article.findByIdAndRemove(mark , function (err,docs) {
            console.log(docs);
            res.redirect("/admin/articleList/");
        });
    } else {
        res.redirect('/admin/login/');
    }

});


/********************类别*********************/
// 类别列表
router.get('/categoryList', function (req,res,next) {
    if(req.session.user){
        category.find(function (err,docs) {
            res.render('categoryList',{
                title:'类别列表',
                user:{name:req.session.user.username},
                categoryList:docs
            });
        });
    } else {
        res.redirect('/admin/login/');
    }
});

// 添加类别
router.get('/addCategory', function (req,res,next) {
    if(req.session.user){
        category.find(function (err,docs) {
            res.render('addCategory',{
                title:'添加类别',
                user:{name:req.session.user.username},
                categoryList:docs
            });
        });
    } else {
        res.redirect('/admin/login/');
    }

}).post('/addCategory', function (req,res,next) {
    category.findOne({columnName:req.body.categoryColumnName},function(err,docs){
        if(docs){
            req.session.error = '此类别已经存在';
            console.log(req.session);
            res.redirect('/admin/addCategory');
        } else {
            // 实例化类别对象
            var parentData = req.body.categoryParent;
            var orderbyData = req.body.categoryOrderby ? req.body.categoryOrderby : '100';
            var categoryNew = new category({
                name : req.body.categoryName,
                columnName:req.body.categoryColumnName,
                parent:parentData,
                img:req.body.categoryImg,
                orderby:orderbyData,
                status:req.body.categoryStatus,
                show_index:req.body.categoryShowIndex,
                person:req.session.user.username
            });
            categoryNew.save(function(err,doc){
                console.log(doc);
                console.log(req.session);
                req.session.success = '类别添加成功';
                res.redirect('/admin/addCategory/');
            });
        }
    });
});

// 删除类别
router.get('/delCategory/:mark', function (req,res,next) {
    var title = req.params.mark;
    if(req.session.user){
        category.findByIdAndRemove(title , function (err,docs) {
            console.log(docs);
            res.redirect("/admin/categoryList/");
        });
    } else {
        res.redirect('/admin/login/');
    }

});

// 修改类别
router.get('/editCategory/:mark', function (req,res,next) {
    var mark = req.params.mark;
    if(req.session.user){
        category.find(function (err,docs) {
            category.findOne({columnName:mark} , function (err,docOne) {
                res.render('editCategory',{title:'修改类别',user:{name:req.session.user.username}, categoryList:docs,categoryOne:docOne,categorySelf:mark});
            });
        });
    } else {
        res.redirect('/admin/login/');
    }

}).post('/editCategory/:mark', function (req,res,next) {
    var mark = req.params.mark;
    var orderbyData = req.body.categoryOrderby ? req.body.categoryOrderby : '100';
    var data = {
        name : req.body.categoryName,
        columnName:req.body.categoryColumnName,
        parent:req.body.categoryParent,
        img:req.body.categoryImg,
        orderby:orderbyData,
        status:req.body.categoryStatus,
        show_index:req.body.categoryShowIndex,
        person:req.session.user.username
    };
    category.findOneAndUpdate({columnName:mark} , data, function (err,doc) {
        res.redirect('/admin/categoryList/');
    });
});

/********************登录-登出-注册*********************/
// 登录
router.get('/login', function(req, res, next) {
  res.render('login',{title:'登录'});
}).post('/login', function(req, res, next) {
    //将登录的密码转成md5形式
    var md5=crypto.createHash("md5");
    var password=md5.update(req.body.password).digest("base64");
    //验证用户
    users.findOne({username:req.body.username},function(err,docs){
        //首先根据用户名查询是否存在
        if(!docs){
            req.session.error="用户不存在";
            console.log(req.session);
            return res.redirect("/admin/login/");
        } else {
            //验证密码是否正确
            if(docs.password!=password){
                req.session.error="用户密码错误";
                console.log(req.session);
                return res.redirect("/admin/login");
            }
            req.session.user=docs;
            req.session.success="登录成功";
            console.log(req.session);
            res.redirect("/admin/");
        }
    });
});

// 注册
router.get('/register', function(req, res, next) {
  res.render('register',{title:'注册'});
}).post('/register', function(req, res, next) {
    // 判断是否登录
    if(req.session.user){
        req.session.error = "已处于登录状态";
        console.log(req.session);
        return res.redirect("/admin/");
    }
    //检验用户两次输入的口令是否一致
    if(req.body["password-repeat"]!=req.body['password']){
        req.session.error="两次输入的口令不一致";
        console.log(req.session);
        return res.redirect("/admin/register/");
    }
    users.findOne({username:req.body.username},function(err,docs){
        if(docs){
            req.session.error = '用户名已存在';
            console.log(req.session);
            res.redirect('/admin/register/');
        } else {
            //生成口令的散列值，我们使用md5加密
            var md5=crypto.createHash('md5');
            var password=md5.update(req.body.password).digest("base64");
            //声明需要添加的用户
            var user = new users({
                username : req.body.username,
                password:password
            });
            user.save(function(err,doc){
                console.log(doc);
                req.session.success = '注册成功';
                res.redirect('/admin/register/');
            });
        }
    });
});

// 登出
router.get('/logout', function(req, res, next) {
  console.log("登出了");
  req.session.user=null;
  req.session.success="退出成功";
  console.log(req.session);
  res.redirect("/admin/");
});

module.exports = router;
