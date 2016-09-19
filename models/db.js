/**
 * Created by wy on 16/8/18.
 */

// 数据库配置
var settings = {
    cookieSecret:"nokeyCMS",// cookie加密
    db:"nokeyCMS",// 数据库名称
    host:"localhost", // 地址
    port:27017
};

var mongoose = require("mongoose");
var db = mongoose.connection;
var DB_URL = 'mongodb://'+settings.host+'/'+settings.db;
module.exports = mongoose.connect(DB_URL);
/**
 * 连接成功
 */
db.on('connected', function () {
    console.log('Mongoose connection open to ' + DB_URL);
});

/**
 * 连接异常
 */
db.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});

/**
 * 连接断开
 */
db.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
});